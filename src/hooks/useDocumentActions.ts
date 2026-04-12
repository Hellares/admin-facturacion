import { useState } from 'react';
import { message } from 'antd';
import apiClient from '@/lib/axios';
import { downloadFile, openPdfInNewTab } from '@/utils/download';

type DocType = 'invoices' | 'boletas' | 'credit-notes' | 'debit-notes' | 'dispatch-guides' | 'daily-summaries' | 'voided-documents' | 'retentions';

export function useDocumentActions(documentType: DocType) {
  const [sendLoading, setSendLoading] = useState(false);

  const sendToSunat = async (id: number, docNumber: string, onSuccess?: () => void) => {
    setSendLoading(true);
    try {
      await apiClient.post(`/v1/${documentType}/${id}/send-sunat`);
      message.success(`${docNumber} enviado a SUNAT exitosamente`);
      onSuccess?.();
    } catch {
      message.error(`Error al enviar ${docNumber} a SUNAT`);
    } finally {
      setSendLoading(false);
    }
  };

  const downloadXml = async (id: number, docNumber: string) => {
    try {
      await downloadFile(`/v1/${documentType}/${id}/download-xml`, `${docNumber}.xml`);
    } catch {
      message.error('Error al descargar XML');
    }
  };

  const downloadCdr = async (id: number, docNumber: string) => {
    try {
      await downloadFile(`/v1/${documentType}/${id}/download-cdr`, `CDR-${docNumber}.xml`);
    } catch {
      message.error('Error al descargar CDR');
    }
  };

  const viewPdf = async (id: number) => {
    try {
      await openPdfInNewTab(`/v1/${documentType}/${id}/download-pdf`);
    } catch {
      message.error('Error al abrir PDF');
    }
  };

  const generatePdf = async (id: number) => {
    try {
      await apiClient.post(`/v1/${documentType}/${id}/generate-pdf`);
      message.success('PDF generado correctamente');
    } catch {
      message.error('Error al generar PDF');
    }
  };

  return {
    sendLoading,
    sendToSunat,
    downloadXml,
    downloadCdr,
    viewPdf,
    generatePdf,
  };
}
