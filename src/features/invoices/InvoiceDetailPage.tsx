import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Space, Alert, Button } from 'antd';
import { StopOutlined, LinkOutlined, FileExclamationOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import OrigenTag from '@/components/common/OrigenTag';
import DocumentActions from '@/components/common/DocumentActions';
import WhatsAppShareButton from '@/components/common/WhatsAppShareButton';
import DocumentPdfViewer from '@/components/common/DocumentPdfViewer';
import ComprobanteDetalle from '@/components/common/ComprobanteDetalle';
import { useInvoice } from './hooks/useInvoices';
import { useDocumentAnulacionInfo } from '@/hooks/useDocumentAnulacionInfo';
import { formatDate, formatMoney } from '@/utils/format';
import { isRechazoReenviable } from '@/utils/sunat';
import type { Moneda } from '@/types/common.types';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading, refetch } = useInvoice(Number(id));
  const [pdfOpen, setPdfOpen] = useState(false);
  const { info: anulacionInfo } = useDocumentAnulacionInfo(invoice);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!invoice) return <div>Factura no encontrada</div>;

  const moneda = invoice.moneda as Moneda;


  const acciones = (
    <Space wrap>
      <DocumentActions
        documentType="invoices"
        documentId={invoice.id}
        documentNumber={invoice.numero_completo}
        status={invoice.estado_sunat}
        sunatCode={invoice.sunat?.codigo}
        onStatusChange={() => refetch()}
        onViewPdf={() => setPdfOpen(true)}
      />
      <WhatsAppShareButton
        tipo="01"
        documentType="invoices"
        documentId={invoice.id}
        numero={invoice.numero_completo}
        status={invoice.estado_sunat}
        empresa={invoice.empresa}
        cliente={invoice.cliente}
        total={invoice.totales?.total ?? invoice.mto_imp_venta}
        moneda={moneda}
      />
    </Space>
  );

  const avisos = (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Banner de rechazo/error: aparece cuando SUNAT rechazo o hubo error tecnico */}
        {(invoice.estado_sunat === 'RECHAZADO' || invoice.estado_sunat === 'ERROR') && invoice.sunat?.descripcion && (
          <Alert
            type="error"
            showIcon
            message={
              <Space wrap size="small">
                <strong>{invoice.estado_sunat === 'RECHAZADO' ? 'RECHAZADO POR SUNAT' : 'ERROR TECNICO'}</strong>
                {invoice.sunat.codigo && (
                  <Tag color="red" style={{ fontFamily: 'monospace', margin: 0 }}>
                    Codigo {invoice.sunat.codigo}
                  </Tag>
                )}
              </Space>
            }
            description={
              <div>
                <div style={{ marginTop: 4 }}>{invoice.sunat.descripcion}</div>
                {invoice.sunat.notas && invoice.sunat.notas.length > 0 && (
                  <ul style={{ marginTop: 8, marginBottom: 0 }}>
                    {invoice.sunat.notas.map((n: string, i: number) => <li key={i}>{n}</li>)}
                  </ul>
                )}
                <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
                  {invoice.estado_sunat === 'ERROR' || isRechazoReenviable(invoice.sunat.codigo)
                    ? 'Error tecnico (conectividad, credenciales SOL, etc). No llego a validarse en SUNAT: puedes reintentar el envio con el mismo numero.'
                    : 'SUNAT rechazo por validacion. Corregir y emitir un documento NUEVO; no se puede reenviar el mismo.'}
                </div>
              </div>
            }
          />
        )}

        {/* Banner de anulacion: aparece cuando la factura fue dada de baja via RA */}
        {anulacionInfo && (
          <Alert
            type="error"
            showIcon
            icon={<StopOutlined />}
            message={
              <Space wrap size="small">
                <strong>DOCUMENTO ANULADO</strong>
                <span>Comunicacion de Baja:</span>
                <Tag color="red" style={{ fontFamily: 'monospace', margin: 0 }}>
                  {anulacionInfo.numero_completo}
                </Tag>
                <SunatStatusBadge status={anulacionInfo.estado_sunat} />
                <Button
                  size="small"
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => navigate(anulacionInfo.detailRoute)}
                >
                  Ver detalle
                </Button>
              </Space>
            }
            description={
              anulacionInfo.motivo ? <span style={{ fontSize: 12 }}>Motivo: {anulacionInfo.motivo}</span> : undefined
            }
          />
        )}
        {/* Notas de credito asociadas */}
        {invoice.credit_notes && invoice.credit_notes.length > 0 && invoice.credit_notes.map((nc) => (
          <Alert
            key={`nc-${nc.id}`}
            type="warning"
            showIcon
            icon={<FileExclamationOutlined />}
            message={
              <Space wrap size="small">
                <strong>NOTA DE CREDITO</strong>
                <Tag color="orange" style={{ fontFamily: 'monospace', margin: 0 }}>{nc.numero_completo}</Tag>
                <SunatStatusBadge status={nc.estado_sunat as import('@/types/common.types').SunatStatus} />
                <span style={{ fontSize: 12, color: '#666' }}>{nc.motivo}</span>
                <Tag>{formatMoney(nc.total, nc.moneda as Moneda)}</Tag>
                <Button size="small" type="link" icon={<LinkOutlined />} onClick={() => navigate(`/credit-notes/${nc.id}`)}>
                  Ver detalle
                </Button>
              </Space>
            }
          />
        ))}

        {/* Notas de debito asociadas */}
        {invoice.debit_notes && invoice.debit_notes.length > 0 && invoice.debit_notes.map((nd) => (
          <Alert
            key={`nd-${nd.id}`}
            type="info"
            showIcon
            icon={<ExclamationCircleOutlined />}
            message={
              <Space wrap size="small">
                <strong>NOTA DE DEBITO</strong>
                <Tag color="blue" style={{ fontFamily: 'monospace', margin: 0 }}>{nd.numero_completo}</Tag>
                <SunatStatusBadge status={nd.estado_sunat as import('@/types/common.types').SunatStatus} />
                <span style={{ fontSize: 12, color: '#666' }}>{nd.motivo}</span>
                <Tag>{formatMoney(nd.total, nd.moneda as Moneda)}</Tag>
                <Button size="small" type="link" icon={<LinkOutlined />} onClick={() => navigate(`/debit-notes/${nd.id}`)}>
                  Ver detalle
                </Button>
              </Space>
            }
          />
        ))}

      </Space>
  );

  const detraccion = invoice.detraccion ? (
    <Card title="Detracción" size="small" style={{ borderRadius: 8 }}>
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Código">{invoice.detraccion.codigo_bien_servicio}</Descriptions.Item>
        <Descriptions.Item label="Cuenta banco">{invoice.detraccion.cuenta_banco}</Descriptions.Item>
        <Descriptions.Item label="Porcentaje">{invoice.detraccion.porcentaje}%</Descriptions.Item>
        <Descriptions.Item label="Monto">{formatMoney(invoice.detraccion.monto || 0, moneda)}</Descriptions.Item>
      </Descriptions>
    </Card>
  ) : null;

  return (
    <div>
      <ComprobanteDetalle
        tipoNombre="Factura electrónica"
        numero={invoice.numero_completo}
        volver={{ label: 'Facturas', path: '/invoices' }}
        fechaEmision={invoice.fecha_emision}
        creadoEn={invoice.created_at}
        actualizadoEn={invoice.updated_at}
        moneda={moneda}
        formaPago={invoice.forma_pago?.tipo}
        cliente={invoice.cliente}
        detalles={invoice.detalles}
        totales={invoice.totales}
        estado={invoice.estado_sunat}
        anulado={!!anulacionInfo}
        respuestaSunat={invoice.sunat?.descripcion}
        hash={invoice.hash}
        acciones={acciones}
        avisos={avisos}
        extra={detraccion}
        datos={[
          { label: 'Origen', value: <OrigenTag origen={invoice.origen} size="default" /> },
          { label: 'Vencimiento', value: invoice.fecha_vencimiento ? formatDate(invoice.fecha_vencimiento) : '-' },
          { label: 'Tipo de operación', value: invoice.tipo_operacion || '-' },
          { label: 'Notas', value: (invoice.credit_notes?.length ?? 0) + (invoice.debit_notes?.length ?? 0) || 'Ninguna' },
          { label: 'Email del cliente', value: invoice.cliente?.email || '-', ancho: true },
        ]}
      />

      <DocumentPdfViewer
        documentType="invoices"
        documentId={invoice.id}
        documentNumber={invoice.numero_completo}
        estadoSunat={invoice.estado_sunat}
        sunatInfo={invoice.sunat ?? invoice.respuesta_sunat}
        sourceDocument={invoice}
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
      />
    </div>
  );
}
