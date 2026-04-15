import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Space, Divider, Alert, Button } from 'antd';
import { StopOutlined, LinkOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import OrigenTag from '@/components/common/OrigenTag';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import DocumentActions from '@/components/common/DocumentActions';
import DocumentPdfViewer from '@/components/common/DocumentPdfViewer';
import { useDebitNote } from './hooks/useDebitNotes';
import { useDocumentAnulacionInfo } from '@/hooks/useDocumentAnulacionInfo';
import { formatDate, formatMoney } from '@/utils/format';
import { calculateItemTotals } from '@/utils/tax-calculator';
import type { DetalleItem, Moneda } from '@/types/common.types';

export default function DebitNoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: nd, isLoading, refetch } = useDebitNote(Number(id));
  const [pdfOpen, setPdfOpen] = useState(false);
  const { info: anulacionInfo } = useDocumentAnulacionInfo(nd);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!nd) return <div>Nota de Debito no encontrada</div>;

  const moneda = nd.moneda as Moneda;

  const itemColumns: ColumnsType<DetalleItem> = [
    { title: '#', width: 40, render: (_, __, i) => i + 1 },
    { title: 'Codigo', dataIndex: 'codigo', width: 100 },
    { title: 'Descripcion', dataIndex: 'descripcion', ellipsis: true },
    { title: 'Cant.', dataIndex: 'cantidad', width: 70, align: 'right' },
    { title: 'P. Unit.', width: 100, align: 'right', render: (_, r) => formatMoney(calculateItemTotals(r).mto_precio_unitario, moneda) },
    { title: 'IGV', width: 90, align: 'right', render: (_, r) => formatMoney(calculateItemTotals(r).igv, moneda) },
    { title: 'Total', width: 110, align: 'right', render: (_, r) => <strong>{formatMoney(calculateItemTotals(r).total_item, moneda)}</strong> },
  ];

  return (
    <div>
      <PageHeader
        title={`Nota de Debito ${nd.numero_completo}`}
        showBack
        breadcrumbs={[{ title: 'Notas de Debito', path: '/debit-notes' }, { title: nd.numero_completo }]}
        extra={
          <DocumentActions
            documentType="debit-notes"
            documentId={nd.id}
            documentNumber={nd.numero_completo}
            status={nd.estado_sunat}
            onStatusChange={() => refetch()}
            onViewPdf={() => setPdfOpen(true)}
          />
        }
      />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {anulacionInfo && (
          <Alert
            type="error"
            showIcon
            icon={<StopOutlined />}
            message={
              <Space wrap size="small">
                <strong>NOTA DE DEBITO ANULADA</strong>
                <span>Comunicacion de Baja:</span>
                <Tag color="red" style={{ fontFamily: 'monospace', margin: 0 }}>
                  {anulacionInfo.numero_completo}
                </Tag>
                <SunatStatusBadge status={anulacionInfo.estado_sunat} />
                <Button size="small" type="link" icon={<LinkOutlined />} onClick={() => navigate(anulacionInfo.detailRoute)}>
                  Ver detalle
                </Button>
              </Space>
            }
            description={anulacionInfo.motivo ? <span style={{ fontSize: 12 }}>Motivo: {anulacionInfo.motivo}</span> : undefined}
          />
        )}
        <Card>
          <Descriptions column={{ xs: 1, sm: 2, lg: 4 }}>
            <Descriptions.Item label="Numero">{nd.numero_completo}</Descriptions.Item>
            <Descriptions.Item label="Fecha">{formatDate(nd.fecha_emision)}</Descriptions.Item>
            <Descriptions.Item label="Estado"><SunatStatusBadge status={nd.estado_sunat} /></Descriptions.Item>
            <Descriptions.Item label="Origen"><OrigenTag origen={nd.origen} size="default" /></Descriptions.Item>
            <Descriptions.Item label="Moneda">{nd.moneda}</Descriptions.Item>
            <Descriptions.Item label="Doc. Afectado"><Tag>{nd.documento_afectado?.tipo === '01' ? 'Factura' : 'Boleta'}</Tag> {nd.documento_afectado?.numero_completo}</Descriptions.Item>
            <Descriptions.Item label="Motivo">{nd.cod_motivo ? `${nd.cod_motivo} - ${nd.des_motivo ?? ''}` : '-'}</Descriptions.Item>
            {nd.sunat?.descripcion && <Descriptions.Item label="Respuesta SUNAT" span={4}>{nd.sunat.descripcion}</Descriptions.Item>}
          </Descriptions>
        </Card>

        <Card title="Cliente" size="small">
          <Descriptions column={{ xs: 1, sm: 3 }}>
            <Descriptions.Item label="Documento">{nd.cliente?.tipo_documento} - {nd.cliente?.numero_documento}</Descriptions.Item>
            <Descriptions.Item label="Razon Social">{nd.cliente?.razon_social}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Items" size="small">
          <Table columns={itemColumns} dataSource={nd.detalles} rowKey={(_, i) => String(i)} size="small" pagination={false} scroll={{ x: 700 }} />
        </Card>

        <Card title="Totales" size="small" style={{ maxWidth: 400, marginLeft: 'auto' }}>
          <Descriptions column={1} size="small" colon={false}>
            {(nd.totales?.gravada ?? 0) > 0 && <Descriptions.Item label="Op. Gravadas">{formatMoney(nd.totales?.gravada ?? 0, moneda)}</Descriptions.Item>}
            <Descriptions.Item label="IGV">{formatMoney(nd.totales?.igv ?? 0, moneda)}</Descriptions.Item>
            <Divider style={{ margin: '4px 0' }} />
            <Descriptions.Item label={<strong>TOTAL</strong>}><MoneyDisplay amount={nd.totales?.total ?? 0} moneda={moneda} strong size="large" /></Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>

      <DocumentPdfViewer
        documentType="debit-notes"
        documentId={nd.id}
        documentNumber={nd.numero_completo}
        estadoSunat={nd.estado_sunat}
        sunatInfo={nd.sunat ?? nd.respuesta_sunat}
        sourceDocument={nd}
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
      />
    </div>
  );
}
