import { fetchApi } from "@/lib/apiClient";

export async function getLabOrders() {
  return fetchApi('/lab/laborders');
}

export async function collectSample(orderId: string, specimenType: string, barcode: string) {
  return fetchApi(`/lab/laborder/${orderId}/collect`, {
    method: 'POST',
    body: JSON.stringify({ specimen_type: specimenType, barcode })
  });
}

export async function validateLabResults(orderId: string) {
  return fetchApi(`/lab/laborder/${orderId}/validate`, {
    method: 'POST'
  });
}

export async function submitLabResults(orderId: string, results: any[]) {
  return fetchApi(`/lab/laborder/${orderId}/results`, {
    method: 'POST',
    body: JSON.stringify({ results })
  });
}
