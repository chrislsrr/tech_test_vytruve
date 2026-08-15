import api from './api';

// Types pour correspondre au backend NestJS
interface FileEntity {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  path: string;
  patientId: string;
  createdAt: string;
  updatedAt: string;
}

// Service pour la gestion des fichiers
export const fileService = {
  // Upload un fichier pour un patient
  upload: async (patientId: string, file: File): Promise<FileEntity> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/patients/${patientId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Récupérer tous les fichiers d'un patient
  getByPatient: async (patientId: string): Promise<FileEntity[]> => {
    const response = await api.get(`/patients/${patientId}/files`);
    return response.data;
  },

  // Supprimer un fichier
  delete: async (patientId: string, fileId: string): Promise<void> => {
    await api.delete(`/patients/${patientId}/files/${fileId}`);
  },
};

export type { FileEntity };
