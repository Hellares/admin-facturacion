import { Button, Space, Tooltip, message } from 'antd';
import {
  SendOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { showSendSunatConfirm } from './ConfirmModal';
import { downloadFile, openPdfInNewTab } from '@/utils/download';
import apiClient from '@/lib/axios';
import { showApiError } from '@/lib/api-error';
import type { SunatStatus } from '@/types/common.types';

interface DocumentActionsProps {
  documentType: 'invoices' | 'boletas' | 'credit-notes' | 'debit-notes' | 'dispatch-guides' | 'daily-summaries' | 'voided-documents' | 'retentions';
  documentId: number;
  documentNumber: string;
  status: SunatStatus;
  onStatusChange?: () => void;
  compact?: boolean;
  /**
   * Si se provee, el boton PDF llamara este callback en lugar de abrir en
   * nueva tab. Usado por las list pages que muestran el PDF en un Modal
   * embebido (DocumentPdfViewer).
   */
  onViewPdf?: () => void;
}

export default function DocumentActions({
  documentType,
  documentId,
  documentNumber,
  status,
  onStatusChange,
  compact = false,
  onViewPdf,
}: DocumentActionsProps) {
  const [sendLoading, setSendLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const canSend = status === 'PENDIENTE' || status === 'ERROR';
  const hasSentFiles = status === 'ACEPTADO';

  const handleSend = () => {
    showSendSunatConfirm(async () => {
      setSendLoading(true);
      try {
        await apiClient.post(`/v1/${documentType}/${documentId}/send-sunat`);
        message.success(`Documento ${documentNumber} enviado a SUNAT`);
        onStatusChange?.();
      } catch (err) {
        // Muestra codigo SUNAT y descripcion especifica cuando existe
        showApiError(err, `Error al enviar ${documentNumber} a SUNAT`);
        // Aunque falle, refrescamos el estado porque el backend pudo guardar RECHAZADO
        onStatusChange?.();
      } finally {
        setSendLoading(false);
      }
    }, documentNumber);
  };

  const handleDownloadXml = async () => {
    try {
      await downloadFile(`/v1/${documentType}/${documentId}/download-xml`, `${documentNumber}.xml`);
    } catch (err) {
      showApiError(err, 'Error al descargar XML');
    }
  };

  const handleDownloadCdr = async () => {
    try {
      await downloadFile(`/v1/${documentType}/${documentId}/download-cdr`, `CDR-${documentNumber}.xml`);
    } catch (err) {
      showApiError(err, 'Error al descargar CDR');
    }
  };

  const handleDownloadPdf = async () => {
    // Si el componente padre provee onViewPdf, delegar (para abrir modal embebido).
    if (onViewPdf) {
      onViewPdf();
      return;
    }
    // Comportamiento legacy: abrir en nueva tab del navegador.
    setPdfLoading(true);
    try {
      await openPdfInNewTab(`/v1/${documentType}/${documentId}/download-pdf`);
    } catch (err) {
      showApiError(err, 'Error al abrir PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  if (compact) {
    return (
      <Space size={4}>
        {canSend && (
          <Tooltip title="Enviar a SUNAT">
            <Button size="small" type="primary" icon={<SendOutlined />} loading={sendLoading} onClick={handleSend} />
          </Tooltip>
        )}
        <Tooltip title="Descargar XML">
          <Button size="small" icon={<FileTextOutlined />} style={{ color: '#fa8c16' }} onClick={handleDownloadXml} />
        </Tooltip>
        {hasSentFiles && (
          <Tooltip title="Descargar CDR">
            <Button size="small" icon={<CloudDownloadOutlined />} style={{ color: '#722ed1' }} onClick={handleDownloadCdr} />
          </Tooltip>
        )}
        <Tooltip title="Ver PDF">
          <Button size="small" icon={<FilePdfOutlined />} style={{ color: '#ff4d4f' }} loading={pdfLoading} onClick={handleDownloadPdf} />
        </Tooltip>
      </Space>
    );
  }

  return (
    <Space wrap>
      {canSend && (
        <Button type="primary" icon={<SendOutlined />} loading={sendLoading} onClick={handleSend}>
          Enviar a SUNAT
        </Button>
      )}
      <Button icon={<FileTextOutlined />} onClick={handleDownloadXml}>XML</Button>
      {hasSentFiles && (
        <Button icon={<CloudDownloadOutlined />} onClick={handleDownloadCdr}>CDR</Button>
      )}
      <Button icon={<FilePdfOutlined />} loading={pdfLoading} onClick={handleDownloadPdf}>PDF</Button>
    </Space>
  );
}
