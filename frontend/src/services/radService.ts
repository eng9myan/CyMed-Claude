import { fetchApi } from "@/lib/apiClient";

export async function getRadOrders() {
  return fetchApi('/rad/imagingorders');
}

export async function scheduleImaging(orderId: string, scheduledTime: string) {
  return fetchApi(`/rad/imagingorder/${orderId}/schedule`, {
    method: 'POST',
    body: JSON.stringify({ scheduled_time: scheduledTime })
  });
}

export async function completeImaging(orderId: string, dicomUid: string) {
  return fetchApi(`/rad/imagingorder/${orderId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ dicom_uid: dicomUid })
  });
}

export async function submitInterpretation(orderId: string, findings: string, impression: string) {
  return fetchApi(`/rad/imagingorder/${orderId}/interpret`, {
    method: 'POST',
    body: JSON.stringify({ findings, impression })
  });
}
