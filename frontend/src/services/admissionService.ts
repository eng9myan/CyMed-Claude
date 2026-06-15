import { fetchApi } from "@/lib/apiClient";

export async function admitPatient(patientId: string, providerId: string, bedId?: string) {
  return fetchApi('/admissions/admit', {
    method: 'POST',
    body: JSON.stringify({ patient_id: patientId, provider_id: providerId, bed_id: bedId })
  });
}

export async function transferPatient(admissionId: string, newBedId: string, providerId: string) {
  return fetchApi(`/admissions/${admissionId}/transfer`, {
    method: 'POST',
    body: JSON.stringify({ new_bed_id: newBedId, provider_id: providerId })
  });
}

export async function dischargePatient(admissionId: string) {
  return fetchApi(`/admissions/${admissionId}/discharge`, {
    method: 'POST'
  });
}
