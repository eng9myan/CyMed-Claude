import pytest
from django.test import Client
from django.urls import reverse
from auth_app.models import CustomUser, Organization, Facility, Role, UserAssignment
from audit_log_app.models import AuditLog
from pharmacy_app.models import MedicationOrder, SmartDispenseLog
from inventory_app.models import MedicalItem, StorageFacility, InventoryBatch

@pytest.fixture
def setup_tenancy(db):
    org = Organization.objects.create(name="National Health", type="Ministry")
    fac1 = Facility.objects.create(organization=org, name="Main Campus", type="Hospital")
    fac2 = Facility.objects.create(organization=org, name="South Branch", type="Clinic")
    
    role = Role.objects.create(name="Nurse", permissions_json={"can_dispense": True})
    
    user1 = CustomUser.objects.create_user(username="nurse_main", password="pwd")
    UserAssignment.objects.create(
        user=user1, facility=fac1, role=role, is_primary=True, is_active=True,
        department_id="00000000-0000-0000-0000-000000000000"
    )
    
    user2 = CustomUser.objects.create_user(username="nurse_south", password="pwd")
    UserAssignment.objects.create(
        user=user2, facility=fac2, role=role, is_primary=True, is_active=True,
        department_id="00000000-0000-0000-0000-000000000000"
    )
    
    return {
        "fac1": fac1, "fac2": fac2,
        "user1": user1, "user2": user2
    }

@pytest.mark.django_db
def test_tenant_middleware_scopes_correctly(setup_tenancy, client):
    client.force_login(setup_tenancy["user1"])
    response = client.get("/api/patients/patients")
    # Even if it's a 200 or 404, we want to ensure the middleware injected the tenant
    assert response.wsgi_request.tenant is not None
    assert response.wsgi_request.tenant['facility_id'] == setup_tenancy["fac1"].id
    
    client.force_login(setup_tenancy["user2"])
    response = client.get("/api/patients/patients")
    assert response.wsgi_request.tenant['facility_id'] == setup_tenancy["fac2"].id

@pytest.mark.django_db
def test_audit_middleware_logs_mutations(setup_tenancy, client):
    client.force_login(setup_tenancy["user1"])
    
    # We trigger a mock POST to patients. Assuming patient creation might fail validation 
    # if empty, the middleware should STILL log the attempt.
    client.post("/api/patients/patients", data={"global_patient_id": "none"}, content_type="application/json")
    
    audit_logs = AuditLog.objects.filter(user=setup_tenancy["user1"])
    assert audit_logs.count() == 1
    log = audit_logs.first()
    assert log.action == "CREATE"
    assert log.resource_type == "Patients"
    assert log.after_value is not None
    assert log.after_value.get("global_patient_id") == "none"

@pytest.mark.django_db
def test_event_driven_business_logic(setup_tenancy):
    # Setup Inventory
    item = MedicalItem.objects.create(name="Aspirin 81mg", sku="Aspirin 81mg", category="Medication", unit_of_measure="Pieces")
    sf = StorageFacility.objects.create(name="Main Pharmacy", location="Floor 1")
    batch = InventoryBatch.objects.create(item=item, facility=sf, lot_number="LOT1", quantity=100)
    
    # Simulate Pharmacy Dispense Event
    from cymed_core.events import medication_dispensed, emit_event
    emit_event(
        medication_dispensed, 
        sender="pytest", 
        medication_sku="Aspirin 81mg", 
        quantity=20
    )
    
    # Verify Inventory Deducted without hard dependencies
    batch.refresh_from_db()
    assert batch.quantity == 80

@pytest.mark.django_db
def test_patient_registration_workflow(setup_tenancy):
    # Setup Tenant Context
    tenant_context = {
        'facility_id': setup_tenancy["fac1"].id,
        'user_id': setup_tenancy["user1"].id
    }
    patient_data = {
        "mrn": "MRN-TEST-001",
        "first_name": "John",
        "last_name": "Doe",
        "date_of_birth": "1980-01-01",
        "gender": "M"
    }

    from patient_app.services import PatientWorkflowService
    from billing_app.models import Invoice, ServiceCharge

    # Run the Workflow
    patient = PatientWorkflowService.register_patient(patient_data, tenant_context)
    
    # Assert Patient Created
    assert patient.id is not None
    assert patient.global_patient.master_demographics["first_name"] == "John"

    # Verify Event Automation fired and created Billing records
    charges = ServiceCharge.objects.filter(patient_id=patient.id)
    assert charges.count() == 1
    assert charges.first().total_amount == 50.00
    assert charges.first().service_code == "REG-001"

    invoices = Invoice.objects.filter(patient_id=patient.id)
    assert invoices.count() == 1
    assert invoices.first().total_amount == 50.00

@pytest.mark.django_db
def test_clinical_workflow(setup_tenancy):
    tenant_context = {
        'facility_id': setup_tenancy["fac1"].id,
        'user_id': setup_tenancy["user1"].id
    }
    
    # 1. Registration (creates Encounter)
    from patient_app.services import PatientWorkflowService
    patient = PatientWorkflowService.register_patient({
        "mrn": "MRN-CLINICAL-001", "first_name": "Jane", "last_name": "Smith", "date_of_birth": "1990-01-01"
    }, tenant_context)
    
    from patient_app.models import Encounter
    encounter = Encounter.objects.get(patient=patient)
    assert encounter.status == "ARRIVED"
    
    # 2. Triage
    from nursing_app.services import NursingWorkflowService
    NursingWorkflowService.triage_patient(
        encounter_id=encounter.id,
        vitals_data={"temperature": 99.1, "heart_rate": 85},
        user_id=setup_tenancy["user1"].id
    )
    
    encounter.refresh_from_db()
    assert encounter.status == "TRIAGED"
    
    # 3. Consultation (Prescribe Medication, Order Labs and Radiology)
    from patient_app.services import DoctorWorkflowService
    DoctorWorkflowService.complete_consultation(
        encounter_id=encounter.id,
        clinical_data={
            "notes": "Patient has mild fever",
            "diagnoses": [{"name": "Fever"}],
            "medications": [{"name": "Ibuprofen 400mg", "dosage": "400mg", "route": "PO", "frequency": "Q6H"}],
            "lab_orders": ["CBC Panel", "Metabolic Panel"],
            "radiology_orders": ["Chest X-Ray"]
        },
        tenant_context=tenant_context
    )
    
    encounter.refresh_from_db()
    assert encounter.status == "COMPLETED"
    
    # 4. Verify Pharmacy Order Created (Event driven)
    from pharmacy_app.models import MedicationOrder
    orders = MedicationOrder.objects.filter(encounter_id=encounter.id)
    assert orders.count() == 1
    assert orders.first().medication_name == "Ibuprofen 400mg"
    order = orders.first()
    
    # Setup inventory for this medication to verify deduction
    item = MedicalItem.objects.create(name="Ibuprofen 400mg", sku="Ibuprofen 400mg", category="Medication", unit_of_measure="Pieces")
    sf = StorageFacility.objects.create(name="Main Pharmacy", location="Floor 1")
    batch = InventoryBatch.objects.create(item=item, facility=sf, lot_number="LOT2", quantity=50)
    
    # 5. Pharmacy Dispense
    from pharmacy_app.services import PharmacyWorkflowService
    PharmacyWorkflowService.dispense_medication(
        order_id=order.id,
        quantity=10,
        pharmacist_id=setup_tenancy["user1"].id
    )
    
    order.refresh_from_db()
    assert order.status == "DISPENSED"
    
    # Verify Inventory Deduction via event
    batch.refresh_from_db()
    assert batch.quantity == 40

    # 6. Verify Diagnostic Orders Created
    from lab_app.models import LabOrder, LabResult
    lab_orders = LabOrder.objects.filter(encounter_id=encounter.id)
    assert lab_orders.count() == 2 # CBC Panel and Metabolic Panel
    
    from rad_app.models import ImagingOrder
    rad_orders = ImagingOrder.objects.filter(encounter_id=encounter.id)
    assert rad_orders.count() == 1
    assert rad_orders.first().modality == "Chest X-Ray"
    
    # 7. Complete Lab Workflow
    from lab_app.services import LabWorkflowService
    lo = lab_orders.first()
    LabWorkflowService.submit_results(
        order_id=lo.id,
        results_data=[{"test_name": "WBC", "value": "7.5"}],
        technician_id=setup_tenancy["user1"].id
    )
    
    lo.refresh_from_db()
    assert lo.status == "COMPLETED"
    assert LabResult.objects.filter(lab_order=lo).count() == 1

    # 8. Verify Billing Accumulation
    from billing_app.models import Invoice, ServiceCharge
    from decimal import Decimal
    invoices = Invoice.objects.filter(encounter_id=encounter.id)
    assert invoices.count() == 1
    invoice = invoices.first()
    
    # We expect charges for: Registration (50), Consultation (100), Pharmacy (25), Lab (50x2), Radiology (150)
    # Total = 50 + 100 + 25 + 100 + 150 = 425
    charges = ServiceCharge.objects.filter(invoice=invoice)
    assert charges.count() == 6
    assert invoice.total_amount == Decimal('425.00')
    assert invoice.status == "DRAFT"

    # 9. Discharge Patient & Finalize Invoice
    from billing_app.services import BillingWorkflowService
    BillingWorkflowService.finalize_invoice(invoice.id)
    invoice.refresh_from_db()
    assert invoice.status == "FINALIZED"
    
    PatientWorkflowService.discharge_patient(encounter.id, tenant_context)
    encounter.refresh_from_db()
    assert encounter.status == "DISCHARGED"
