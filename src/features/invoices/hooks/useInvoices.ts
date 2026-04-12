import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/services/invoice.service';
import type { InvoiceFormData, InvoiceListParams } from '@/types/invoice.types';

export function useInvoices(params: InvoiceListParams) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceService.getAll(params),
  });
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InvoiceFormData) => invoiceService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InvoiceFormData> }) =>
      invoiceService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice', id] });
    },
  });
}

export function useSendInvoiceToSunat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => invoiceService.sendToSunat(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}
