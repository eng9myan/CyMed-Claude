from django.core.management.base import BaseCommand
from cds_app.models import ClinicalRule

class Command(BaseCommand):
    help = 'Seed the database with advanced Clinical Decision Support (CDS) rules'

    def handle(self, *args, **kwargs):
        rules = [
            {
                "name": "Sepsis Early Warning Protocol",
                "domain": "SEPSIS",
                "condition_expression": "temperature > 38.0 and heart_rate > 90 and respiratory_rate > 20",
                "action_type": "ALERT_HIGH",
                "action_message": "SIRS criteria met. Initiate Sepsis Protocol: draw lactate, blood cultures, administer broad-spectrum IV antibiotics.",
                "alert_level": "HIGH",
                "action_payload": {"order_set": "SEPSIS_BUNDLE"}
            },
            {
                "name": "Severe Hypoglycemia Protocol",
                "domain": "ENDOCRINOLOGY",
                "condition_expression": "blood_glucose < 50",
                "action_type": "ORDER_SUGGESTION",
                "action_message": "Critical Hypoglycemia. Suggest IV Dextrose 50% immediately.",
                "alert_level": "CRITICAL",
                "action_payload": {"medication": "Dextrose 50%", "route": "IV"}
            },
            {
                "name": "Warfarin & Aspirin Bleeding Risk",
                "domain": "DDI",
                "condition_expression": "'warfarin' in current_medications and 'aspirin' in current_medications",
                "action_type": "ALERT_MEDIUM",
                "action_message": "Drug-Drug Interaction: Concurrent use of Warfarin and Aspirin increases bleeding risk. Monitor INR closely.",
                "alert_level": "MEDIUM",
                "action_payload": {"drug_1": "warfarin", "drug_2": "aspirin"}
            },
            {
                "name": "Opioid Naive Respiratory Depression",
                "domain": "PAIN_MANAGEMENT",
                "condition_expression": "new_opioid == True and opioid_naive == True and age > 65",
                "action_type": "ALERT_MEDIUM",
                "action_message": "Elderly Opioid Naive Patient. Start low dose and monitor for respiratory depression.",
                "alert_level": "MEDIUM",
                "action_payload": {"monitoring": "SpO2"}
            }
        ]

        for rule_data in rules:
            ClinicalRule.objects.update_or_create(
                name=rule_data['name'],
                defaults=rule_data
            )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(rules)} advanced CDS rules.'))
