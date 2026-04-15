import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Space, Divider, Alert, Button } from 'antd';
import { StopOutlined, LinkOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import OrigenTag from '@/components/common/OrigenTag';
import EstadoBadge from '@/components/common/EstadoBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import DocumentActions from '@/components/common/DocumentActions';
import DocumentPdfViewer from '@/components/common/DocumentPdfViewer';
import { useBoleta } from './hooks/useBoletas';
import { useDocumentAnulacionInfo } from '@/hooks/useDocumentAnulacionInfo';
import { formatDate, formatMoney } from '@/utils/format';
import { calculateItemTotals } from '@/utils/tax-calculator';
import type { DetalleItem, Moneda } from '@/types/common.types';

export default function BoletaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: boleta, isLoading, refetch } = useBoleta(Number(id));
  const [pdfOpen, setPdfOpen] = useState(false);
  const { info: anulacionInfo, isLocalAnulacion, localMotivo } =
    useDocumentAnulacionInfo(boleta);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!boleta) return <div>Boleta no encontrada</div>;

  const moneda = boleta.moneda as Moneda;

  const itemColumns: ColumnsType<DetalleItem> = [
    { title: '#', width: 40, render: (_, __, i) => i + 1 },
    { title: 'Codigo', dataIndex: 'codigo', width: 100 },
    { title: 'Descripcion', dataIndex: 'descripcion', ellipsis: true },
    { title: 'Und', dataIndex: 'unidad', width: 60 },
    { title: 'Cant.', dataIndex: 'cantidad', width: 70, align: 'right' },
    { title: 'P. Unit.', width: 100, align: 'right', render: (_, r) => formatMoney(calculateItemTotals(r).mto_precio_unitario, moneda) },
    { title: 'IGV', width: 90, align: 'right', render: (_, r) => formatMoney(calculateItemTotals(r).igv, moneda) },
    { title: 'Total', width: 110, align: 'right', render: (_, r) => <strong>{formatMoney(calculateItemTotals(r).total_item, moneda)}</strong> },
  ];

  return (
    <div>
      <PageHeader
        title={`Boleta ${boleta.numero_completo}`}
        showBack
        breadcrumbs={[{ title: 'Boletas', path: '/boletas' }, { title: boleta.numero_completo }]}
        extra={
          <DocumentActions
            documentType="boletas"
            documentId={boleta.id}
            documentNumber={boleta.numero_completo}
            status={boleta.estado_sunat}
            onStatusChange={() => refetch()}
            onViewPdf={() => setPdfOpen(true)}
          />
        }
      />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Banner de anulacion oficial via Resumen Diario (RC) */}
        {anulacionInfo && (
          <Alert
            type="error"
            showIcon
            icon={<StopOutlined />}
            message={
              <Space wrap size="small">
                <strong>BOLETA ANULADA</strong>
                <span>Resumen de Anulacion:</span>
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

        {/* Banner de anulacion local (no notificada a SUNAT) */}
        {isLocalAnulacion && !anulacionInfo && (
          <Alert
            type="warning"
            showIcon
            icon={<StopOutlined />}
            message="Boleta anulada localmente (no notificada a SUNAT)"
            description={localMotivo ? `Motivo: ${localMotivo}` : undefined}
          />
        )}
        <Card>
          <Descriptions column={{ xs: 1, sm: 2, lg: 4 }}>
            <Descriptions.Item label="Numero">{boleta.numero_completo}</Descriptions.Item>
            <Descriptions.Item label="Fecha">{formatDate(boleta.fecha_emision)}</Descriptions.Item>
            <Descriptions.Item label="Estado SUNAT"><SunatStatusBadge status={boleta.estado_sunat} /></Descriptions.Item>
            <Descriptions.Item label="Origen"><OrigenTag origen={boleta.origen} size="default" /></Descriptions.Item>
            <Descriptions.Item label="Metodo Envio">
              <Tag color={boleta.metodo_envio === 'individual' ? 'blue' : 'purple'}>
                {boleta.metodo_envio === 'individual' ? 'Individual' : 'Resumen Diario'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Moneda">{boleta.moneda}</Descriptions.Item>
            <Descriptions.Item label="Forma Pago"><Tag>{boleta.forma_pago?.tipo}</Tag></Descriptions.Item>
            <Descriptions.Item label="Anulacion"><EstadoBadge estado={boleta.estado_anulacion} /></Descriptions.Item>
            {boleta.sunat?.descripcion && <Descriptions.Item label="Respuesta SUNAT" span={4}>{boleta.sunat.descripcion}</Descriptions.Item>}
          </Descriptions>
        </Card>

        <Card title="Cliente" size="small">
          <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
            <Descriptions.Item label="Tipo Doc.">{boleta.cliente?.tipo_documento}</Descriptions.Item>
            <Descriptions.Item label="Nro. Documento">{boleta.cliente?.numero_documento}</Descriptions.Item>
            <Descriptions.Item label="Razon Social">{boleta.cliente?.razon_social}</Descriptions.Item>
            <Descriptions.Item label="Direccion">{boleta.cliente?.direccion || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Detalle de Items" size="small">
          <Table columns={itemColumns} dataSource={boleta.detalles} rowKey={(_, i) => String(i)} size="small" pagination={false} scroll={{ x: 700 }} />
        </Card>

        <Card title="Totales" size="small" style={{ maxWidth: 400, marginLeft: 'auto' }}>
          <Descriptions column={1} size="small" colon={false}>
            {(boleta.totales?.gravada ?? 0) > 0 && <Descriptions.Item label="Op. Gravadas">{formatMoney(boleta.totales?.gravada ?? 0, moneda)}</Descriptions.Item>}
            {(boleta.totales?.exonerada ?? 0) > 0 && <Descriptions.Item label="Op. Exoneradas">{formatMoney(boleta.totales?.exonerada ?? 0, moneda)}</Descriptions.Item>}
            {(boleta.totales?.inafecta ?? 0) > 0 && <Descriptions.Item label="Op. Inafectas">{formatMoney(boleta.totales?.inafecta ?? 0, moneda)}</Descriptions.Item>}
            <Descriptions.Item label="IGV">{formatMoney(boleta.totales?.igv ?? 0, moneda)}</Descriptions.Item>
            <Divider style={{ margin: '4px 0' }} />
            <Descriptions.Item label={<strong>TOTAL</strong>}>
              <MoneyDisplay amount={boleta.totales?.total ?? 0} moneda={moneda} strong size="large" />
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>

      <DocumentPdfViewer
        documentType="boletas"
        documentId={boleta.id}
        documentNumber={boleta.numero_completo}
        estadoSunat={boleta.estado_sunat}
        sunatInfo={boleta.sunat ?? boleta.respuesta_sunat}
        sourceDocument={boleta}
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
      />
    </div>
  );
}
