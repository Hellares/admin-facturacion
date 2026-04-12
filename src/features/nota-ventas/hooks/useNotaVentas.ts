import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notaVentaService } from '@/services/nota-venta.service';
import type { NotaVentaFormData, NotaVentaListParams } from '@/types/nota-venta.types';

export function useNotaVentas(params: NotaVentaListParams) {
  return useQuery({ queryKey: ['nota-ventas', params], queryFn: () => notaVentaService.getAll(params) });
}

export function useNotaVenta(id: number) {
  return useQuery({ queryKey: ['nota-venta', id], queryFn: () => notaVentaService.getById(id), enabled: !!id });
}

export function useCreateNotaVenta() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: NotaVentaFormData) => notaVentaService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['nota-ventas'] }) });
}

export function useConvertirNotaVenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { tipo_documento: '01' | '03'; forma_pago_tipo?: string } }) => notaVentaService.convertir(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nota-ventas'] }),
  });
}

export function useRevertirConversion() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => notaVentaService.revertirConversion(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['nota-ventas'] }) });
}
