import apiClient from '@/lib/axios';
import type { Invoice, InvoiceFormData, InvoiceListParams } from '@/types/invoice.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const invoiceService = {
  getAll: async (params?: InvoiceListParams): Promise<PaginatedResponse<Invoice>> => {
    const response = await apiClient.get<PaginatedResponse<Invoice>>('/v1/invoices', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Invoice> => {
    const response = await apiClient.get<ApiResponse<Invoice>>(`/v1/invoices/${id}`);
    return response.data.data;
  },

  create: async (data: InvoiceFormData): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>('/v1/invoices', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<InvoiceFormData>): Promise<Invoice> => {
    const response = await apiClient.put<ApiResponse<Invoice>>(`/v1/invoices/${id}`, data);
    return response.data.data;
  },

  sendToSunat: async (id: number): Promise<ApiResponse<Invoice>> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(`/v1/invoices/${id}/send-sunat`);
    return response.data;
  },

  sendToSunatAsync: async (id: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/v1/invoices/${id}/send-sunat-async`);
    return response.data;
  },

  generatePdf: async (id: number): Promise<void> => {
    await apiClient.post(`/v1/invoices/${id}/generate-pdf`);
  },

  /**
   * Exporta el listado de facturas filtradas a un archivo XLSX.
   * Descarga el archivo directamente en el navegador.
   */
  exportToExcel: async (params?: InvoiceListParams): Promise<void> => {
    const response = await apiClient.get('/v1/invoices/export', {
      params,
      responseType: 'blob',
      timeout: 90000,
    });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const filename = `facturas-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
