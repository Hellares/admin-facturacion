import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Space, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import DateCell from '@/components/common/DateCell';
import DocumentActions from '@/components/common/DocumentActions';
import { useRetention } from './hooks/useRetentions';
import { formatDate, formatMoney } from '@/utils/format';
import type { RetentionDetail } from '@/types/retention.types';

export default function RetentionDetailPage() {
  const { id } = useParams();
  const { data: ret, isLoading, refetch } = useRetention(Number(id));

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!ret) return <div>Retencion no encontrada</div>;

  const detailCols: ColumnsType<RetentionDetail> = [
    { title: '#', width: 40, render: (_, __, i) => i + 1 },
    { title: 'Tipo', dataIndex: 'tipo_doc', width: 60 },
    { title: 'Numero', dataIndex: 'num_doc', width: 160, render: (t: string) => <span style={{ fontFamily: 'monospace' }}>{t}</span> },
    { title: 'F. Emision', dataIndex: 'fecha_emision', width: 110, render: (d: string) => <DateCell value={d} /> },
    { title: 'F. Retencion', dataIndex: 'fecha_retencion', width: 120, render: (d: string) => <DateCell value={d} /> },
    { title: 'Total Doc.', dataIndex: 'imp_total', width: 110, align: 'right', render: (m: number) => formatMoney(m) },
    { title: 'Imp. Pagar', dataIndex: 'imp_pagar', width: 110, align: 'right', render: (m: number) => formatMoney(m) },
    { title: 'Retenido', dataIndex: 'imp_retenido', width: 110, align: 'right', render: (m: number) => <strong>{formatMoney(m)}</strong> },
  ];

  return (
    <div>
      <PageHeader
        title={`Retencion ${ret.numero_completo}`} showBack
        breadcrumbs={[{ title: 'Retenciones', path: '/retentions' }, { title: ret.numero_completo }]}
        extra={<DocumentActions documentType="retentions" documentId={ret.id} documentNumber={ret.numero_completo} status={ret.estado_sunat} onStatusChange={() => refetch()} />}
      />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card>
          <Descriptions column={{ xs: 1, sm: 2, lg: 4 }}>
            <Descriptions.Item label="Numero">{ret.numero_completo}</Descriptions.Item>
            <Descriptions.Item label="Fecha">{formatDate(ret.fecha_emision)}</Descriptions.Item>
            <Descriptions.Item label="Estado"><SunatStatusBadge status={ret.estado_sunat} /></Descriptions.Item>
            <Descriptions.Item label="Regimen">{ret.regimen} ({ret.tasa}%)</Descriptions.Item>
            {ret.respuesta_sunat && <Descriptions.Item label="Respuesta SUNAT" span={4}>{ret.respuesta_sunat}</Descriptions.Item>}
          </Descriptions>
        </Card>
        <Card title="Proveedor" size="small">
          <Descriptions column={3}>
            <Descriptions.Item label="Documento">{ret.proveedor?.tipo_documento} - {ret.proveedor?.numero_documento}</Descriptions.Item>
            <Descriptions.Item label="Razon Social">{ret.proveedor?.razon_social}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="Documentos Retenidos" size="small">
          <Table columns={detailCols} dataSource={ret.detalles} rowKey={(_, i) => String(i)} size="small" pagination={false} scroll={{ x: 900 }} />
          <Divider />
          <div style={{ textAlign: 'right' }}>
            <Space size="large">
              <span>Total Pagado: <MoneyDisplay amount={ret.imp_pagado} strong /></span>
              <span>Total Retenido: <MoneyDisplay amount={ret.imp_retenido} strong size="large" type="danger" /></span>
            </Space>
          </div>
        </Card>
      </Space>
    </div>
  );
}
