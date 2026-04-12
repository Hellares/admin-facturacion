import { useQuery } from '@tanstack/react-query';
import { voidedDocumentService } from '@/services/voided-document.service';
import { dailySummaryService } from '@/services/daily-summary.service';
import type { SunatStatus } from '@/types/common.types';

/**
 * Info de anulacion normalizada, para mostrar en la toolbar del visor PDF
 * y en banners de los detail pages.
 *
 * Valida para los dos mecanismos SUNAT:
 *   - RA (Comunicacion de Baja) para facturas/NC/ND
 *   - RC (Resumen Diario de Anulacion) para boletas
 */
export interface DocumentAnulacionInfo {
  tipo: 'RA' | 'RC';
  /** Identificador SUNAT del documento de baja (ej "20123-RA-20260411-001" o "RC-20260411-002") */
  numero_completo: string;
  /** Estado SUNAT del documento de baja (PENDIENTE/ENVIADO/PROCESANDO/ACEPTADO/RECHAZADO) */
  estado_sunat: SunatStatus;
  /** Id del documento de baja, para navegar al detalle */
  id: number;
  /** Ruta al detalle del documento de baja */
  detailRoute: string;
  /** Fecha de la solicitud / creacion de la baja */
  fecha?: string | null;
  /** Motivo especifico reportado por el usuario */
  motivo?: string | null;
}

interface DocumentWithAnulacionFields {
  // Factura/NC/ND
  anulado?: boolean;
  voided_document_id?: number | null;
  fecha_anulacion?: string | null;
  motivo_anulacion?: string | null;
  // Boleta
  estado_anulacion?: string;
  anulada_localmente?: boolean;
  daily_summary_id?: number | null;
  motivo_anulacion_local?: string | null;
  fecha_solicitud_anulacion?: string | null;
  fecha_anulacion_local?: string | null;
}

/**
 * Hook que dado un documento (factura o boleta) devuelve la info de la
 * comunicacion de baja que lo anulo, o null si no esta anulado.
 *
 * Dispara una query sobre voided-documents/{id} o daily-summaries/{id}
 * solo si el documento tiene los campos de anulacion poblados.
 */
export function useDocumentAnulacionInfo(
  doc: DocumentWithAnulacionFields | null | undefined
) {
  // Factura/NC/ND: anulado via Comunicacion de Baja (RA)
  const hasVoidedDocument = !!(doc?.anulado && doc?.voided_document_id);

  // Boleta: anulada via Resumen Diario (RC)
  const hasAnulacionRC =
    !!doc?.daily_summary_id &&
    (doc?.estado_anulacion === 'anulada' || doc?.estado_anulacion === 'pendiente_anulacion');

  // Boleta: anulacion local (no hay RA/RC oficial, solo DB)
  const hasLocalAnulacion = !!doc?.anulada_localmente;

  const voidedQuery = useQuery({
    queryKey: ['voided-document', doc?.voided_document_id],
    queryFn: () => voidedDocumentService.getById(doc!.voided_document_id!),
    enabled: hasVoidedDocument,
    staleTime: 60_000,
  });

  const summaryQuery = useQuery({
    queryKey: ['daily-summary', doc?.daily_summary_id],
    queryFn: () => dailySummaryService.getById(doc!.daily_summary_id!),
    enabled: hasAnulacionRC,
    staleTime: 60_000,
  });

  // Normalizar la info al shape unificado
  let info: DocumentAnulacionInfo | null = null;

  if (hasVoidedDocument && voidedQuery.data) {
    info = {
      tipo: 'RA',
      numero_completo: voidedQuery.data.numero_completo,
      estado_sunat: voidedQuery.data.estado_sunat,
      id: voidedQuery.data.id,
      detailRoute: `/voided-documents/${voidedQuery.data.id}`,
      fecha: doc?.fecha_anulacion ?? voidedQuery.data.fecha_emision,
      motivo: doc?.motivo_anulacion ?? voidedQuery.data.motivo_baja,
    };
  } else if (hasAnulacionRC && summaryQuery.data) {
    info = {
      tipo: 'RC',
      numero_completo: summaryQuery.data.numero_completo,
      estado_sunat: summaryQuery.data.estado_sunat,
      id: summaryQuery.data.id,
      detailRoute: `/daily-summaries/${summaryQuery.data.id}`,
      fecha: doc?.fecha_solicitud_anulacion ?? summaryQuery.data.fecha_generacion,
      motivo: doc?.motivo_anulacion,
    };
  }

  return {
    info,
    isLocalAnulacion: hasLocalAnulacion && !hasAnulacionRC,
    localMotivo: doc?.motivo_anulacion_local,
    localFecha: doc?.fecha_anulacion_local,
    isLoading: voidedQuery.isLoading || summaryQuery.isLoading,
  };
}
