import { fetchApi } from "@/lib/apiClient";

export async function getMedicationOrders() {
  return fetchApi('/pharmacy/medicationorders');
}

export async function dispenseMedication(orderId: string, quantity: number, isControlled: boolean = false, verifiedById?: string) {
  return fetchApi(`/pharmacy/medicationorder/${orderId}/dispense`, {
    method: 'POST',
    body: JSON.stringify({ 
      quantity,
      is_controlled: isControlled,
      verified_by_id: verifiedById || null
    })
  });
}

export async function verifyPrescription(orderId: string, notes: string = "", status: string = "VERIFIED") {
  return fetchApi(`/pharmacy/medicationorder/${orderId}/verify`, {
    method: 'POST',
    body: JSON.stringify({ notes, status })
  });
}
