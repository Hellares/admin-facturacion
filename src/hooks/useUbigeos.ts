import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ubigeoService, type UbigeoEntry } from '@/services/ubigeo.service';

/**
 * Carga todos los ubigeos una sola vez y provee helpers para cascading.
 * staleTime: Infinity — los ubigeos no cambian.
 */
export function useUbigeos() {
  const { data: ubigeos = [], isLoading } = useQuery({
    queryKey: ['ubigeos-all'],
    queryFn: ubigeoService.getAll,
    staleTime: Infinity,
  });

  return { ubigeos, isLoading };
}

/** Extrae departamentos únicos ordenados */
export function useDepartamentos(ubigeos: UbigeoEntry[]) {
  return useMemo(
    () => [...new Set(ubigeos.map((u) => u.departamento))].sort(),
    [ubigeos],
  );
}

/** Filtra provincias por departamento seleccionado */
export function useProvincias(ubigeos: UbigeoEntry[], departamento: string | undefined) {
  return useMemo(() => {
    if (!departamento) return [];
    return [
      ...new Set(
        ubigeos
          .filter((u) => u.departamento === departamento)
          .map((u) => u.provincia),
      ),
    ].sort();
  }, [ubigeos, departamento]);
}

/** Filtra distritos por departamento + provincia */
export function useDistritos(
  ubigeos: UbigeoEntry[],
  departamento: string | undefined,
  provincia: string | undefined,
) {
  return useMemo(() => {
    if (!departamento || !provincia) return [];
    return ubigeos
      .filter((u) => u.departamento === departamento && u.provincia === provincia)
      .sort((a, b) => a.distrito.localeCompare(b.distrito));
  }, [ubigeos, departamento, provincia]);
}
