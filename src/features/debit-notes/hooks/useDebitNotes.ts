import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debitNoteService } from '@/services/debit-note.service';
import type { DebitNoteFormData, DebitNoteListParams } from '@/types/debit-note.types';

export function useDebitNotes(params: DebitNoteListParams) {
  return useQuery({
    queryKey: ['debit-notes', params],
    queryFn: () => debitNoteService.getAll(params),
  });
}

export function useDebitNote(id: number) {
  return useQuery({
    queryKey: ['debit-note', id],
    queryFn: () => debitNoteService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDebitNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DebitNoteFormData) => debitNoteService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debit-notes'] }),
  });
}

export function useDebitNoteMotivos() {
  return useQuery({
    queryKey: ['debit-note-motivos'],
    queryFn: () => debitNoteService.getMotivos(),
    staleTime: 30 * 60 * 1000,
  });
}
