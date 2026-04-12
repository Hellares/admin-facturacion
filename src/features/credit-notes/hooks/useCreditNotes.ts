import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditNoteService } from '@/services/credit-note.service';
import type { CreditNoteFormData, CreditNoteListParams } from '@/types/credit-note.types';

export function useCreditNotes(params: CreditNoteListParams) {
  return useQuery({
    queryKey: ['credit-notes', params],
    queryFn: () => creditNoteService.getAll(params),
  });
}

export function useCreditNote(id: number) {
  return useQuery({
    queryKey: ['credit-note', id],
    queryFn: () => creditNoteService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCreditNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreditNoteFormData) => creditNoteService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['credit-notes'] }),
  });
}

export function useCreditNoteMotivos() {
  return useQuery({
    queryKey: ['credit-note-motivos'],
    queryFn: () => creditNoteService.getMotivos(),
    staleTime: 30 * 60 * 1000, // 30 min cache
  });
}
