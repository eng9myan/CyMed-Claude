import { fetchApi } from '../lib/apiClient';

export interface Patient {
  id: string;
  mrn: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_type: string | null;
  is_active: boolean;
}

export const getPatients = async (): Promise<Patient[]> => {
  return await fetchApi('/patients/');
};

export const getPatientById = async (id: string): Promise<Patient> => {
  return await fetchApi(`/patients/${id}`);
};

export const createPatient = async (patientData: Omit<Patient, 'id' | 'is_active'>): Promise<Patient> => {
  return await fetchApi('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
  });
};
