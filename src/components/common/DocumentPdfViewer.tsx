import { useEffect, useState } from 'react';
import { Modal, Space, Button, Tag, Spin, Alert, Tooltip, Typography } from 'antd';
import {
  DownloadOutlined,
  FileTextOutlined,
  CloudDownloadOutlined,
  StopOutlined,
  LinkOutlined,
  FileExclamationOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/axios';
import SunatStatusBadge from './SunatStatusBadge';
import { downloadFile } from '@/utils/download';
import { showApiError } from '@/lib/api-error';
import { useDocumentAnulacionInfo } from '@/hooks/useDocumentAnulacionInfo';
import type { SunatStatus, Moneda } from '@/types/common.types';
import type { SunatInfo } from './SunatStatusBadge';
import { formatMoney } from '@/utils/format';

interface RelatedNote {
  id: number;
  numero_completo: string;
  motivo: string;
  cod_motivo: string;
  estado_sunat: string;
  total: number;
  moneda: string;
}

const { Text } = Typography;

export type PdfViewerDocumentType =
  | 'invoices'
  | 'boletas'
  | 'credit-notes'
  | 'debit-notes'
  | 'dispatch-guides'
  | 'daily-summaries'
  | 'voided-documents'
  | 'retentions';

interface DocumentPdfViewerProps {
  /** Tipo de documento — determina el endpoint base */
  documentType: PdfViewerDocumentType;
  /** ID del documento */
  documentId: number | null;
  /** Numero completo del documento, para el titulo del modal */
  documentNumber: string;
  /** Estado SUNAT actual, para mostrar en la barra superior */
  estadoSunat?: SunatStatus | null;
  /** Info SUNAT (codigo/descripcion) para tooltip en RECHAZADO/ERROR */
  sunatInfo?: SunatInfo | string | null;
  /**
   * Documento fuente con los campos de anulacion (opcional).
   * Si se provee y esta anulado, el visor mostrara una tira informativa
   * con link a la Comunicacion de Baja / Resumen Diario que lo anulo.
   */
  sourceDocument?: {
    anulado?: boolean;
    voided_document_id?: number | null;
    fecha_anulacion?: string | null;
    motivo_anulacion?: string | null;
    estado_anulacion?: string;
    anulada_localmente?: boolean;
    daily_summary_id?: number | null;
    motivo_anulacion_local?: string | null;
    fecha_solicitud_anulacion?: string | null;
    fecha_anulacion_local?: string | null;
  } | null;
  /** Notas de credito asociadas (solo para facturas/boletas) */
  creditNotes?: RelatedNote[];
  /** Notas de debito asociadas (solo para facturas/boletas) */
  debitNotes?: RelatedNote[];
  open: boolean;
  onClose: () => void;
}

/**
 * Modal que muestra el PDF de un documento electronico embebido en un iframe,
 * con una toolbar superior que incluye el estado SUNAT y, si el documento fue
 * anulado, un tag con link a la Comunicacion de Baja (RA) o Resumen Diario (RC)
 * que lo dio de baja.
 *
 * Diseño inspirado en visores de proveedores SUNAT: el PDF original es
 * inmutable y el estado de anulacion vive FUERA del PDF en la metadata del
 * visor, preservando la firma digital del documento original.
 */
export default function DocumentPdfViewer({
  documentType,
  documentId,
  documentNumber,
  estadoSunat,
  sunatInfo,
  sourceDocument,
  creditNotes,
  debitNotes,
  open,
  onClose,
}: DocumentPdfViewerProps) {
  const navigate = useNavigate();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Info de la comunicacion de baja / resumen diario que anulo este documento
  const { info: anulacionInfo, isLocalAnulacion, localMotivo } =
    useDocumentAnulacionInfo(sourceDocument);

  // Fetch notas de credito/debito asociadas (solo para facturas y boletas)
  const [fetchedCreditNotes, setFetchedCreditNotes] = useState<RelatedNote[]>([]);
  const [fetchedDebitNotes, setFetchedDebitNotes] = useState<RelatedNote[]>([]);

  useEffect(() => {
    if (!open || documentId == null) return;
    if (creditNotes || debitNotes) return; // Si ya se pasan por prop, no fetchar
    if (documentType !== 'invoices' && documentType !== 'boletas') return;

    setFetchedCreditNotes([]);
    setFetchedDebitNotes([]);

    apiClient.get(`/v1/${documentType}/${documentId}`)
      .then((res) => {
        const data = res.data?.data;
        if (data?.credit_notes) setFetchedCreditNotes(data.credit_notes);
        if (data?.debit_notes) setFetchedDebitNotes(data.debit_notes);
      })
      .catch(() => { /* silencioso — no bloquea el PDF */ });
  }, [open, documentType, documentId, creditNotes, debitNotes]);

  const activeCreditNotes = creditNotes || fetchedCreditNotes;
  const activeDebitNotes = debitNotes || fetchedDebitNotes;

  // Fetch del PDF cuando se abre el modal
  useEffect(() => {
    if (!open || documentId == null) {
      return;
    }

    let revokedUrl: string | null = null;
    setLoading(true);
    setError(null);
    setBlobUrl(null);

    apiClient
      .get(`/v1/${documentType}/${documentId}/download-pdf`, {
        responseType: 'blob',
        timeout: 45000,
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        revokedUrl = url;
        setBlobUrl(url);
      })
      .catch((err) => {
        showApiError(err, 'Error al cargar PDF');
        setError('No se pudo cargar el PDF. Revise los permisos o intente de nuevo.');
      })
      .finally(() => setLoading(false));

    return () => {
      if (revokedUrl) {
        window.URL.revokeObjectURL(revokedUrl);
      }
    };
  }, [open, documentType, documentId]);

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setBlobUrl(null);
      setError(null);
    }
  }, [open]);

  const handleDownloadPdf = async () => {
    if (documentId == null) return;
    try {
      await downloadFile(
        `/v1/${documentType}/${documentId}/download-pdf`,
        `${documentNumber}.pdf`
      );
    } catch (err) {
      showApiError(err, 'Error al descargar PDF');
    }
  };

  const handleDownloadXml = async () => {
    if (documentId == null) return;
    try {
      await downloadFile(
        `/v1/${documentType}/${documentId}/download-xml`,
        `${documentNumber}.xml`
      );
    } catch (err) {
      showApiError(err, 'Error al descargar XML');
    }
  };

  const handleDownloadCdr = async () => {
    if (documentId == null) return;
    try {
      await downloadFile(
        `/v1/${documentType}/${documentId}/download-cdr`,
        `CDR-${documentNumber}.xml`
      );
    } catch (err) {
      showApiError(err, 'Error al descargar CDR');
    }
  };

  const goToAnulacion = () => {
    if (!anulacionInfo) return;
    onClose();
    navigate(anulacionInfo.detailRoute);
  };

  const hasCdr = estadoSunat === 'ACEPTADO';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width="min(1100px, 95vw)"
      destroyOnHidden
      footer={null}
      title={
        <Space size="middle" wrap>
          <span style={{ fontFamily: 'monospace', fontSize: 15 }}>{documentNumber}</span>
          {estadoSunat && <SunatStatusBadge status={estadoSunat} sunatInfo={sunatInfo} />}
        </Space>
      }
      styles={{ body: { padding: 0 } }}
    >
      {/* Toolbar superior: acciones + tira de anulacion si aplica */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
        }}
      >
        <Space wrap size="small">
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadPdf}>
            Descargar PDF
          </Button>
          <Button icon={<FileTextOutlined />} onClick={handleDownloadXml}>
            XML
          </Button>
          {hasCdr && (
            <Button icon={<CloudDownloadOutlined />} onClick={handleDownloadCdr}>
              CDR
            </Button>
          )}
        </Space>

        {/* Tira informativa de anulacion: SOLO aparece si el documento fue dado de baja */}
        {anulacionInfo && (
          <Alert
            type="error"
            showIcon
            icon={<StopOutlined />}
            style={{ marginTop: 10 }}
            message={
              <Space wrap size="small">
                <Text strong>{anulacionInfo.tipo === 'RA' ? 'Comunicacion de Baja' : 'Resumen de Anulacion'}:</Text>
                <Tag color="red" style={{ fontFamily: 'monospace', margin: 0 }}>
                  {anulacionInfo.numero_completo}
                </Tag>
                <SunatStatusBadge status={anulacionInfo.estado_sunat} />
                <Tooltip title="Abrir detalle de la baja">
                  <Button
                    size="small"
                    type="link"
                    icon={<LinkOutlined />}
                    onClick={goToAnulacion}
                  >
                    Ver detalle
                  </Button>
                </Tooltip>
              </Space>
            }
            description={
              anulacionInfo.motivo ? (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Motivo: {anulacionInfo.motivo}
                </Text>
              ) : undefined
            }
          />
        )}

        {/* Caso de anulacion local (solo DB, sin notificar SUNAT) */}
        {isLocalAnulacion && !anulacionInfo && (
          <Alert
            type="warning"
            showIcon
            icon={<StopOutlined />}
            style={{ marginTop: 10 }}
            message="Anulada localmente (no notificada a SUNAT)"
            description={localMotivo ? `Motivo: ${localMotivo}` : undefined}
          />
        )}

        {/* Notas de credito asociadas */}
        {activeCreditNotes && activeCreditNotes.length > 0 && activeCreditNotes.map((nc) => (
          <Alert
            key={`nc-${nc.id}`}
            type="warning"
            showIcon
            icon={<FileExclamationOutlined />}
            style={{ marginTop: 10 }}
            message={
              <Space wrap size="small">
                <Text strong>NOTA DE CREDITO</Text>
                <Tag color="orange" style={{ fontFamily: 'monospace', margin: 0 }}>{nc.numero_completo}</Tag>
                <SunatStatusBadge status={nc.estado_sunat as SunatStatus} />
                <span style={{ fontSize: 12, color: '#666' }}>{nc.motivo}</span>
                <Tag>{formatMoney(nc.total, nc.moneda as Moneda)}</Tag>
                <Button size="small" type="link" icon={<LinkOutlined />} onClick={() => { onClose(); navigate(`/credit-notes/${nc.id}`); }}>
                  Ver detalle
                </Button>
              </Space>
            }
          />
        ))}

        {/* Notas de debito asociadas */}
        {activeDebitNotes && activeDebitNotes.length > 0 && activeDebitNotes.map((nd) => (
          <Alert
            key={`nd-${nd.id}`}
            type="info"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{ marginTop: 10 }}
            message={
              <Space wrap size="small">
                <Text strong>NOTA DE DEBITO</Text>
                <Tag color="blue" style={{ fontFamily: 'monospace', margin: 0 }}>{nd.numero_completo}</Tag>
                <SunatStatusBadge status={nd.estado_sunat as SunatStatus} />
                <span style={{ fontSize: 12, color: '#666' }}>{nd.motivo}</span>
                <Tag>{formatMoney(nd.total, nd.moneda as Moneda)}</Tag>
                <Button size="small" type="link" icon={<LinkOutlined />} onClick={() => { onClose(); navigate(`/debit-notes/${nd.id}`); }}>
                  Ver detalle
                </Button>
              </Space>
            }
          />
        ))}
      </div>

      {/* Visor PDF embebido */}
      <div style={{ height: 'min(75vh, 800px)', background: '#525659' }}>
        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#fff',
            }}
          >
            <Spin size="large" tip="Cargando PDF..." />
          </div>
        )}
        {error && !loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: 24,
            }}
          >
            <Alert type="error" message={error} showIcon />
          </div>
        )}
        {blobUrl && !loading && (
          <iframe
            /**
             * Fragment params del visor PDF nativo (Adobe PDF Open Parameters):
             *   pagemode=none  - oculta el sidebar de thumbnails/bookmarks
             *   toolbar=1      - mantiene la toolbar con zoom/descarga
             *   view=FitH      - ajusta la pagina al ancho disponible
             * Chrome/Edge/Firefox soportan estos parametros en su PDF viewer.
             */
            src={`${blobUrl}#pagemode=none&toolbar=1&view=FitH`}
            title={`PDF ${documentNumber}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
          />
        )}
      </div>
    </Modal>
  );
}
