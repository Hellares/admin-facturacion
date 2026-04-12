import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cotizacionService } from '@/services/cotizacion.service';
import type { CotizacionFormData, CotizacionListParams } from '@/types/cotizacion.types';

export function useCotizaciones(params: CotizacionListParams) {
  return useQuery({ queryKey: ['cotizaciones', params], queryFn: () => cotizacionService.getAll(params) });
}

export function useCotizacion(id: number) {
  return useQuery({ queryKey: ['cotizacion', id], queryFn: () => cotizacionService.getById(id), enabled: !!id });
}

export function useCreateCotizacion() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: CotizacionFormData) => cotizacionService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['cotizaciones'] }) });
}

export function useEnviarCotizacion() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => cotizacionService.enviar(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['cotizaciones'] }) });
}

export function useAceptarCotizacion() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => cotizacionService.aceptar(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['cotizaciones'] }) });
}

export function useRechazarCotizacion() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, motivo }: { id: number; motivo?: string }) => cotizacionService.rechazar(id, { motivo_rechazo: motivo }), onSuccess: () => qc.invalidateQueries({ queryKey: ['cotizaciones'] }) });
}

export function useConvertirCotizacion() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, tipo }: { id: number; tipo: 'invoice' | 'boleta' }) => cotizacionService.convertir(id, { tipo_documento: tipo }), onSuccess: () => qc.invalidateQueries({ queryKey: ['cotizaciones'] }) });
}

export function useDuplicarCotizacion() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => cotizacionService.duplicar(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['cotizaciones'] }) });
}
