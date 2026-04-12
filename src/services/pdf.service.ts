import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';

export interface PdfFormat {
  name: string;
  width: number;
  height: number;
  unit: string;
  description: string;
}

export const pdfService = {
  getFormats: async (): Promise<PdfFormat[]> => {
    const response = await apiClient.get<ApiResponse<PdfFormat[]>>('/v1/pdf/formats');
    return response.data.data;
  },
};
