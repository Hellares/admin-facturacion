import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voidedDocumentService } from '@/services/voided-document.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import type { VoidedDocumentFormData } from '@/types/voided-document.types';
import type { ListQueryParams } from '@/types/api.types';

export function useVoidedDocuments(params: ListQueryParams) {
  return useQuery({
    queryKey: ['voided-documents', params],
    queryFn: () => voidedDocumentService.getAll(params),
  });
}

export function useVoidedDocument(id: number) {
  return useQuery({
    queryKey: ['voided-document', id],
    queryFn: () => voidedDocumentService.getById(id),
    enabled: !!id,
  });
}

export function useCreateVoidedDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VoidedDocumentFormData) => voidedDocumentService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['voided-documents'] }),
  });
}

export function useSendVoidedDocumentToSunat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => voidedDocumentService.sendToSunat(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['voided-documents'] });
      qc.invalidateQueries({ queryKey: ['voided-document', id] });
      qc.invalidateQueries({ queryKey: ['anulaciones'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['credit-notes'] });
      qc.invalidateQueries({ queryKey: ['debit-notes'] });
    },
  });
}

/**
 * Mutacion para verificar el estado de una Comunicacion de Baja ante SUNAT.
 * Util cuando el estado esta PROCESANDO y queremos refrescarlo manualmente.
 */
export function useCheckVoidedDocumentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => voidedDocumentService.checkStatus(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['voided-documents'] });
      qc.invalidateQueries({ queryKey: ['voided-document', id] });
      qc.invalidateQueries({ queryKey: ['anulaciones'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['credit-notes'] });
      qc.invalidateQueries({ queryKey: ['debit-notes'] });
    },
  });
}

export function useAvailableDocuments() {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);
  return useQuery({
    queryKey: ['voided-available', companyId],
    queryFn: () => voidedDocumentService.getAvailableDocuments({ company_id: companyId ?? undefined }),
    enabled: !!companyId,
  });
}

export function useVoidedReasons() {
  return useQuery({
    queryKey: ['voided-reasons'],
    queryFn: () => voidedDocumentService.getReasons(),
    staleTime: 30 * 60 * 1000,
  });
}
