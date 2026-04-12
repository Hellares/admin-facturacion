import { useQuery } from '@tanstack/react-query';
import { dailySummaryService } from '@/services/daily-summary.service';
import { voidedDocumentService } from '@/services/voided-document.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import type { VoidedDocument, VoidedDocItem } from '@/types/voided-document.types';
import type { DailySummary } from '@/types/daily-summary.types';
import type {
  AnulacionDocumento,
  AnulacionItem,
  TipoDocumentoAnulado,
} from '../types';

/**
 * Subset de detalles estado=3 expuesto por el endpoint de listado de
 * daily-summaries para facilitar la pagina de Anulaciones.
 */
interface SummaryAnulacionItem {
  tipo_documento: string;
  serie_numero: string;
}

/**
 * Extiende DailySummary con los campos que el endpoint de listado ahora
 * incluye pero no estan en el tipo base. Evitamos modificar el tipo base
 * para no romper consumidores actuales.
 */
interface DailySummaryListItem extends DailySummary {
  anulaciones?: SummaryAnulacionItem[];
  contiene_anulaciones?: boolean;
}

/**
 * Filtros aplicables desde la pagina de Anulaciones.
 */
export interface AnulacionesFilter {
  company_id?: number;
  /** 'all' | 'boletas' (RC con estado=3) | 'facturas' (RA) */
  tipo?: 'all' | 'boletas' | 'facturas';
}

/**
 * Hook que agrega los dos origenes de anulaciones en una sola lista ordenada
 * por fecha descendente. Hace dos queries en paralelo (daily-summaries y
 * voided-documents), filtra/normaliza ambas y devuelve un array unico.
 *
 * Diseño:
 *   - Frontend-only merge: el backend no expone /anulaciones.
 *     Mantiene la API limpia y permite al operador seguir yendo a los modulos
 *     individuales sin romper contratos.
 *   - Los RC normales (emision batch de boletas) se filtran out: solo
 *     interesan los RC cuyo detalle contenga al menos un item con estado=3.
 */
export function useAnulaciones(filter: AnulacionesFilter = {}) {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const effectiveCompanyId = filter.company_id ?? companyId ?? undefined;

  const summariesQuery = useQuery({
    queryKey: ['anulaciones', 'summaries', effectiveCompanyId],
    queryFn: () =>
      dailySummaryService.getAll({
        company_id: effectiveCompanyId,
      }),
    enabled: !!effectiveCompanyId,
  });

  const voidedQuery = useQuery({
    queryKey: ['anulaciones', 'voided', effectiveCompanyId],
    queryFn: () =>
      voidedDocumentService.getAll({
        company_id: effectiveCompanyId,
      }),
    enabled: !!effectiveCompanyId,
  });

  const items: AnulacionItem[] = [];
  const tipo = filter.tipo ?? 'all';

  // Normalizar RC → AnulacionItem (solo los que contienen estado=3)
  // El backend expone un subset slim `anulaciones[]` en el listado para
  // que no tengamos que inspeccionar el JSON completo de detalles.
  if (tipo === 'all' || tipo === 'boletas') {
    const summaries = (summariesQuery.data?.data ?? []) as DailySummaryListItem[];
    for (const summary of summaries) {
      const anulacionesSub = Array.isArray(summary.anulaciones) ? summary.anulaciones : [];
      if (anulacionesSub.length === 0) continue;

      const documentos: AnulacionDocumento[] = anulacionesSub.map((d) => ({
        tipo_documento: (d.tipo_documento || '03') as TipoDocumentoAnulado,
        numero: d.serie_numero || '-',
      }));

      items.push({
        id: summary.id,
        origen: 'RC',
        identificador: summary.numero_completo,
        fecha: summary.fecha_generacion || summary.fecha_resumen,
        estado_sunat: summary.estado_sunat,
        respuesta_sunat: summary.respuesta_sunat ?? null,
        ticket: summary.ticket ?? null,
        cantidad_documentos: anulacionesSub.length,
        documentos,
        detalleRuta: `/daily-summaries/${summary.id}`,
      });
    }
  }

  // Normalizar RA → AnulacionItem
  if (tipo === 'all' || tipo === 'facturas') {
    const voided = (voidedQuery.data?.data ?? []) as VoidedDocument[];
    for (const vd of voided) {
      const detalles: VoidedDocItem[] = Array.isArray(vd.documentos) ? vd.documentos : [];

      const documentos: AnulacionDocumento[] = detalles.map((d) => {
        // El backend ahora devuelve `numero_completo` (ej. "F001-000003").
        // Si por alguna razon no esta, lo construimos a partir de serie+correlativo.
        const numero =
          d.numero_completo ||
          (d.serie && d.correlativo != null ? `${d.serie}-${d.correlativo}` : '-');
        return {
          tipo_documento: (d.tipo_documento || '01') as TipoDocumentoAnulado,
          numero,
          motivo: d.motivo_especifico,
        };
      });

      items.push({
        id: vd.id,
        origen: 'RA',
        // El backend devuelve el identificador canonico en `numero_completo`
        identificador: vd.numero_completo,
        fecha: vd.fecha_emision || vd.fecha_comunicacion || vd.fecha_generacion || '',
        estado_sunat: vd.estado_sunat,
        respuesta_sunat: vd.respuesta_sunat ?? null,
        ticket: vd.ticket ?? null,
        cantidad_documentos: detalles.length,
        documentos,
        detalleRuta: `/voided-documents/${vd.id}`,
      });
    }
  }

  // Ordenar por fecha descendente (mas recientes arriba)
  items.sort((a, b) => {
    const da = new Date(a.fecha).getTime();
    const db = new Date(b.fecha).getTime();
    return db - da;
  });

  return {
    items,
    isLoading: summariesQuery.isLoading || voidedQuery.isLoading,
    isError: summariesQuery.isError || voidedQuery.isError,
    refetch: () => {
      summariesQuery.refetch();
      voidedQuery.refetch();
    },
  };
}
