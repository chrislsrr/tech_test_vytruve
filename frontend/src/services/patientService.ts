import api from './api';

// Types pour correspondre au backend NestJS
interface CreatePatientDto {
  lastName: string;
  firstName: string;
  age: number;
}

interface Patient {
  id: string;
  lastName: string;
  firstName: string;
  age: number;
  createdAt?: string;
  updatedAt?: string;
}

// Service pour la gestion des patients
export const patientService = {
  // Créer un nouveau patient
  create: async (data: CreatePatientDto): Promise<Patient> => {
    const response = await api.post('/patients', data);
    return response.data;
  },

  // Récupérer tous les patients
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get('/patients');
    return response.data;
  },

  // Récupérer un patient par ID
  getById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Mettre à jour un patient
  update: async (id: string, data: Partial<CreatePatientDto>): Promise<Patient> => {
    const response = await api.patch(`/patients/${id}`, data);
    return response.data;
  },

  // Supprimer un patient
  delete: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },
};

export type { CreatePatientDto, Patient };
