import { fetchApi } from "@/lib/apiClient";

export async function getEncounters(status?: string) {
  return fetchApi('/patients/encounters');
}

export async function triagePatient(encounterId: string, vitals: any) {
  return fetchApi('/nursing/triage', {
    method: 'POST',
    body: JSON.stringify({
      encounter_id: encounterId,
      ...vitals
    })
  });
}

export async function consultPatient(encounterId: string, payload: any) {
  return fetchApi(`/patients/encounter/${encounterId}/consult`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
