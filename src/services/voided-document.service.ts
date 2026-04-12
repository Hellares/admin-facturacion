import apiClient from '@/lib/axios';
import type { VoidedDocument, VoidedDocumentFormData, VoidedReason, AvailableDocument } from '@/types/voided-document.types';
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api.types';

export const voidedDocumentService = {
  getAll: async (params?: ListQueryParams): Promise<PaginatedResponse<VoidedDocument>> => {
    const response = await apiClient.get<PaginatedResponse<VoidedDocument>>('/v1/voided-documents', { params });
    return response.data;
  },

  getById: async (id: number): Promise<VoidedDocument> => {
    const response = await apiClient.get<ApiResponse<VoidedDocument>>(`/v1/voided-documents/${id}`);
    return response.data.data;
  },

  create: async (data: VoidedDocumentFormData): Promise<VoidedDocument> => {
    const response = await apiClient.post<ApiResponse<VoidedDocument>>('/v1/voided-documents', data);
    return response.data.data;
  },

  sendToSunat: async (id: number): Promise<ApiResponse<VoidedDocument>> => {
    const response = await apiClient.post<ApiResponse<VoidedDocument>>(`/v1/voided-documents/${id}/send-sunat`);
    return response.data;
  },

  checkStatus: async (id: number): Promise<ApiResponse<VoidedDocument>> => {
    const response = await apiClient.post<ApiResponse<VoidedDocument>>(`/v1/voided-documents/${id}/check-status`);
    return response.data;
  },

  getAvailableDocuments: async (params?: { company_id?: number }): Promise<AvailableDocument[]> => {
    const response = await apiClient.get<ApiResponse<AvailableDocument[]>>('/v1/voided-documents/available-documents', { params });
    return response.data.data;
  },

  getReasons: async (): Promise<VoidedReason[]> => {
    const response = await apiClient.get<ApiResponse<VoidedReason[]>>('/v1/voided-documents/reasons');
    return response.data.data;
  },

  getReasonCategories: async (): Promise<unknown[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/v1/voided-documents/reasons/categories');
    return response.data.data;
  },

  getReasonByCode: async (codigo: string): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/v1/voided-documents/reasons/${codigo}`);
    return response.data.data;
  },
};
