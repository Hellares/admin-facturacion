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
import { useCreditNote } from './hooks/useCreditNotes';
import { useDocumentAnulacionInfo } from '@/hooks/useDocumentAnulacionInfo';
import { formatDate, formatMoney } from '@/utils/format';
import { calculateItemTotals } from '@/utils/tax-calculator';
import type { DetalleItem, Moneda } from '@/types/common.types';

export default function CreditNoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: nc, isLoading, refetch } = useCreditNote(Number(id));
  const [pdfOpen, setPdfOpen] = useState(false);
  const { info: anulacionInfo } = useDocumentAnulacionInfo(nc);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!nc) return <div>Nota de Credito no encontrada</div>;

  const moneda = nc.moneda as Moneda;

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
        title={`Nota de Credito ${nc.numero_completo}`}
        showBack
        breadcrumbs={[{ title: 'Notas de Credito', path: '/credit-notes' }, { title: nc.numero_completo }]}
        extra={
          <DocumentActions
            documentType="credit-notes"
            documentId={nc.id}
            documentNumber={nc.numero_completo}
            status={nc.estado_sunat}
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
                <strong>NOTA DE CREDITO ANULADA</strong>
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
            <Descriptions.Item label="Numero">{nc.numero_completo}</Descriptions.Item>
            <Descriptions.Item label="Fecha">{formatDate(nc.fecha_emision)}</Descriptions.Item>
            <Descriptions.Item label="Estado"><SunatStatusBadge status={nc.estado_sunat} /></Descriptions.Item>
            <Descriptions.Item label="Origen"><OrigenTag origen={nc.origen} size="default" /></Descriptions.Item>
            <Descriptions.Item label="Moneda">{nc.moneda}</Descriptions.Item>
            <Descriptions.Item label="Doc. Afectado"><Tag>{nc.documento_afectado?.tipo === '01' ? 'Factura' : 'Boleta'}</Tag> {nc.documento_afectado?.numero_completo}</Descriptions.Item>
            <Descriptions.Item label="Motivo">{nc.cod_motivo ? `${nc.cod_motivo} - ${nc.des_motivo ?? ''}` : '-'}</Descriptions.Item>
            {nc.sunat?.descripcion && <Descriptions.Item label="Respuesta SUNAT" span={4}>{nc.sunat.descripcion}</Descriptions.Item>}
          </Descriptions>
        </Card>

        <Card title="Cliente" size="small">
          <Descriptions column={{ xs: 1, sm: 3 }}>
            <Descriptions.Item label="Documento">{nc.cliente?.tipo_documento} - {nc.cliente?.numero_documento}</Descriptions.Item>
            <Descriptions.Item label="Razon Social">{nc.cliente?.razon_social}</Descriptions.Item>
            <Descriptions.Item label="Direccion">{nc.cliente?.direccion || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Items" size="small">
          <Table columns={itemColumns} dataSource={nc.detalles} rowKey={(_, i) => String(i)} size="small" pagination={false} scroll={{ x: 700 }} />
        </Card>

        <Card title="Totales" size="small" style={{ maxWidth: 400, marginLeft: 'auto' }}>
          <Descriptions column={1} size="small" colon={false}>
            {(nc.totales?.gravada ?? 0) > 0 && <Descriptions.Item label="Op. Gravadas">{formatMoney(nc.totales?.gravada ?? 0, moneda)}</Descriptions.Item>}
            <Descriptions.Item label="IGV">{formatMoney(nc.totales?.igv ?? 0, moneda)}</Descriptions.Item>
            <Divider style={{ margin: '4px 0' }} />
            <Descriptions.Item label={<strong>TOTAL</strong>}><MoneyDisplay amount={nc.totales?.total ?? 0} moneda={moneda} strong size="large" /></Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>

      <DocumentPdfViewer
        documentType="credit-notes"
        documentId={nc.id}
        documentNumber={nc.numero_completo}
        estadoSunat={nc.estado_sunat}
        sunatInfo={nc.sunat ?? nc.respuesta_sunat}
        sourceDocument={nc}
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
      />
    </div>
  );
}
