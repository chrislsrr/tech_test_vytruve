import api from './api';

// Types pour correspondre au backend NestJS
interface StartPrintJobDto {
  fileId: string;
  patientId: string;
  socketReference: string;
}

interface PrintJob {
  id: string;
  fileId: string;
  patientId: string;
  socketReference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  endDate?: string;
  progress?: number;
}

// Service pour la gestion des impressions
// Timeout de 30 secondes pour ces routes
export const printService = {
  // Démarrer une nouvelle impression
  startPrintJob: async (dto: StartPrintJobDto): Promise<PrintJob> => {
    const response = await api.post('/printing/start', dto, { timeout: 30000 });
    return response.data;
  },

  // Lister toutes les impressions
  listPrintJobs: async (): Promise<PrintJob[]> => {
    const response = await api.get('/printing', { timeout: 30000 });
    return response.data;
  },
};

export type { StartPrintJobDto, PrintJob };
