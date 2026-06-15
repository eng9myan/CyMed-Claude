import { fetchApi } from "@/lib/apiClient";

export async function getAvailableBeds(wardId?: string) {
  const url = wardId ? `/beds/available?ward_id=${wardId}` : '/beds/available';
  return fetchApi(url);
}

export async function cleanBed(bedId: string) {
  return fetchApi(`/beds/${bedId}/clean`, {
    method: 'POST'
  });
}
