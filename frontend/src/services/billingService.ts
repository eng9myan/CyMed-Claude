import { fetchApi } from "@/lib/apiClient";

export async function generateInvoice(patientId: string, encounterId: string) {
  return fetchApi(`/billing/invoices/generate?patient_id=${patientId}&encounter_id=${encounterId}`, {
    method: 'POST'
  });
}

export async function getInvoices(patientId?: string) {
  const url = patientId ? `/billing/invoices?patient_id=${patientId}` : '/billing/invoices';
  return fetchApi(url);
}

export async function payInvoice(invoiceId: string, amount: number, paymentMethod: string, referenceNumber?: string) {
  return fetchApi(`/billing/invoices/${invoiceId}/pay`, {
    method: 'POST',
    body: JSON.stringify({ amount, payment_method: paymentMethod, reference_number: referenceNumber })
  });
}

export async function finalizeInvoice(invoiceId: string) {
  return fetchApi(`/billing/invoices/${invoiceId}/finalize`, {
    method: 'POST'
  });
}

export async function dischargePatient(encounterId: string) {
  return fetchApi(`/clinical/encounters/${encounterId}/discharge`, {
    method: 'POST'
  });
}
