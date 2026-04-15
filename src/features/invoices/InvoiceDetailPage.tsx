import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Space, Divider, Alert, Button } from 'antd';
import { StopOutlined, LinkOutlined, FileExclamationOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import OrigenTag from '@/components/common/OrigenTag';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import DocumentActions from '@/components/common/DocumentActions';
import DocumentPdfViewer from '@/components/common/DocumentPdfViewer';
import { useInvoice } from './hooks/useInvoices';
import { useDocumentAnulacionInfo } from '@/hooks/useDocumentAnulacionInfo';
import { formatDate, formatMoney } from '@/utils/format';
import { calculateItemTotals } from '@/utils/tax-calculator';
import type { DetalleItem } from '@/types/common.types';
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

  const itemColumns: ColumnsType<DetalleItem> = [
    { title: '#', width: 40, render: (_, __, i) => i + 1 },
    { title: 'Codigo', dataIndex: 'codigo', width: 100 },
    { title: 'Descripcion', dataIndex: 'descripcion', ellipsis: true },
    { title: 'Und', dataIndex: 'unidad', width: 60 },
    { title: 'Cant.', dataIndex: 'cantidad', width: 70, align: 'right' },
    {
      title: 'P. Unit.',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const totals = calculateItemTotals(record);
        return formatMoney(totals.mto_precio_unitario, moneda);
      },
    },
    {
      title: 'V. Venta',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const totals = calculateItemTotals(record);
        return formatMoney(totals.mto_valor_venta, moneda);
      },
    },
    {
      title: 'IGV',
      width: 90,
      align: 'right',
      render: (_, record) => {
        const totals = calculateItemTotals(record);
        return formatMoney(totals.igv, moneda);
      },
    },
    {
      title: 'Total',
      width: 110,
      align: 'right',
      render: (_, record) => {
        const totals = calculateItemTotals(record);
        return <strong>{formatMoney(totals.total_item, moneda)}</strong>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Factura ${invoice.numero_completo}`}
        showBack
        breadcrumbs={[
          { title: 'Facturas', path: '/invoices' },
          { title: invoice.numero_completo },
        ]}
        extra={
          <DocumentActions
            documentType="invoices"
            documentId={invoice.id}
            documentNumber={invoice.numero_completo}
            status={invoice.estado_sunat}
            onStatusChange={() => refetch()}
            onViewPdf={() => setPdfOpen(true)}
          />
        }
      />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
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
                  {invoice.estado_sunat === 'ERROR'
                    ? 'Error tecnico (conectividad, certificado, etc). Puedes reintentar el envio.'
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

        {/* Estado y datos generales */}
        <Card>
          <Descriptions column={{ xs: 1, sm: 2, lg: 4 }}>
            <Descriptions.Item label="Numero">{invoice.numero_completo}</Descriptions.Item>
            <Descriptions.Item label="Fecha Emision">{formatDate(invoice.fecha_emision)}</Descriptions.Item>
            <Descriptions.Item label="Fecha Vencimiento">{formatDate(invoice.fecha_vencimiento)}</Descriptions.Item>
            <Descriptions.Item label="Estado SUNAT">
              <SunatStatusBadge status={invoice.estado_sunat} />
            </Descriptions.Item>
            <Descriptions.Item label="Origen">
              <OrigenTag origen={invoice.origen} size="default" />
            </Descriptions.Item>
            <Descriptions.Item label="Moneda">{invoice.moneda}</Descriptions.Item>
            <Descriptions.Item label="Tipo Operacion">{invoice.tipo_operacion}</Descriptions.Item>
            <Descriptions.Item label="Forma Pago">
              <Tag>{invoice.forma_pago?.tipo}</Tag>
            </Descriptions.Item>
            {invoice.sunat?.descripcion && (
              <Descriptions.Item label="Respuesta SUNAT" span={4}>
                {invoice.sunat.descripcion}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Cliente */}
        <Card title="Cliente" size="small">
          <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
            <Descriptions.Item label="Tipo Doc.">{invoice.cliente?.tipo_documento}</Descriptions.Item>
            <Descriptions.Item label="Nro. Documento">{invoice.cliente?.numero_documento}</Descriptions.Item>
            <Descriptions.Item label="Razon Social">{invoice.cliente?.razon_social}</Descriptions.Item>
            <Descriptions.Item label="Direccion">{invoice.cliente?.direccion || '-'}</Descriptions.Item>
            <Descriptions.Item label="Email">{invoice.cliente?.email || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Items */}
        <Card title="Detalle de Items" size="small">
          <Table
            columns={itemColumns}
            dataSource={invoice.detalles}
            rowKey={(_, i) => String(i)}
            size="small"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Totales */}
        <Card title="Totales" size="small" style={{ maxWidth: 400, marginLeft: 'auto' }}>
          <Descriptions column={1} size="small" colon={false}>
            {(invoice.totales?.gravada ?? 0) > 0 && (
              <Descriptions.Item label="Op. Gravadas">{formatMoney(invoice.totales?.gravada ?? 0, moneda)}</Descriptions.Item>
            )}
            {(invoice.totales?.exonerada ?? 0) > 0 && (
              <Descriptions.Item label="Op. Exoneradas">{formatMoney(invoice.totales?.exonerada ?? 0, moneda)}</Descriptions.Item>
            )}
            {(invoice.totales?.inafecta ?? 0) > 0 && (
              <Descriptions.Item label="Op. Inafectas">{formatMoney(invoice.totales?.inafecta ?? 0, moneda)}</Descriptions.Item>
            )}
            <Descriptions.Item label="IGV">{formatMoney(invoice.totales?.igv ?? 0, moneda)}</Descriptions.Item>
            {(invoice.totales?.isc ?? 0) > 0 && (
              <Descriptions.Item label="ISC">{formatMoney(invoice.totales?.isc ?? 0, moneda)}</Descriptions.Item>
            )}
            <Divider style={{ margin: '4px 0' }} />
            <Descriptions.Item label={<strong>TOTAL</strong>}>
              <MoneyDisplay amount={invoice.totales?.total ?? 0} moneda={moneda} strong size="large" />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Detraccion */}
        {invoice.detraccion && (
          <Card title="Detraccion" size="small">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Codigo">{invoice.detraccion.codigo_bien_servicio}</Descriptions.Item>
              <Descriptions.Item label="Cuenta Banco">{invoice.detraccion.cuenta_banco}</Descriptions.Item>
              <Descriptions.Item label="Porcentaje">{invoice.detraccion.porcentaje}%</Descriptions.Item>
              <Descriptions.Item label="Monto">{formatMoney(invoice.detraccion.monto || 0, moneda)}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Space>

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
