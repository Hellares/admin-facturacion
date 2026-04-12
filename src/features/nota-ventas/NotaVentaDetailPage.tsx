import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Space, Button, Modal, message } from 'antd';
import { SwapOutlined, RollbackOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EstadoBadge from '@/components/common/EstadoBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import { useNotaVenta, useConvertirNotaVenta, useRevertirConversion } from './hooks/useNotaVentas';
import { formatDate, formatMoney } from '@/utils/format';
import { openPdfInNewTab } from '@/utils/download';
import type { NotaVentaDetalle } from '@/types/nota-venta.types';

export default function NotaVentaDetailPage() {
  const { id } = useParams();
  const { data: nv, isLoading, refetch } = useNotaVenta(Number(id));
  const convertMutation = useConvertirNotaVenta();
  const revertMutation = useRevertirConversion();
  const [convertModal, setConvertModal] = useState(false);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!nv) return <div>Nota de venta no encontrada</div>;

  const handleConvert = async (tipo: '01' | '03') => {
    try {
      await convertMutation.mutateAsync({ id: nv.id, data: { tipo_documento: tipo } });
      message.success('Convertida exitosamente');
      setConvertModal(false);
      refetch();
    } catch { message.error('Error'); }
  };

  const handleRevert = async () => {
    try {
      await revertMutation.mutateAsync(nv.id);
      message.success('Conversion revertida');
      refetch();
    } catch { message.error('Error'); }
  };

  return (
    <div>
      <PageHeader
        title={`Nota de Venta ${nv.numero_completo}`} showBack
        breadcrumbs={[{ title: 'Notas de Venta', path: '/nota-ventas' }, { title: nv.numero_completo }]}
        extra={
          <Space>
            {nv.estado_conversion === 'pendiente' && <Button type="primary" icon={<SwapOutlined />} onClick={() => setConvertModal(true)}>Convertir</Button>}
            {nv.estado_conversion === 'convertida' && <Button icon={<RollbackOutlined />} loading={revertMutation.isPending} onClick={handleRevert}>Revertir</Button>}
            <Button icon={<FilePdfOutlined />} onClick={() => openPdfInNewTab(`/v1/nota-ventas/${nv.id}/download-pdf`).catch(() => message.error('Error'))}>PDF</Button>
          </Space>
        }
      />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card>
          <Descriptions column={{ xs: 1, sm: 2, lg: 4 }}>
            <Descriptions.Item label="Numero">{nv.numero_completo}</Descriptions.Item>
            <Descriptions.Item label="Fecha">{formatDate(nv.fecha_emision)}</Descriptions.Item>
            <Descriptions.Item label="Moneda">{nv.moneda}</Descriptions.Item>
            <Descriptions.Item label="Estado"><EstadoBadge estado={nv.estado_conversion} /></Descriptions.Item>
            {nv.documento_convertido_numero && <Descriptions.Item label="Convertido a">{nv.documento_convertido_numero}</Descriptions.Item>}
          </Descriptions>
        </Card>
        <Card title="Cliente" size="small">
          <Descriptions column={3}>
            <Descriptions.Item label="Documento">{nv.cliente?.tipo_documento} - {nv.cliente?.numero_documento}</Descriptions.Item>
            <Descriptions.Item label="Razon Social">{nv.cliente?.razon_social}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="Items" size="small">
          <Table size="small" pagination={false} dataSource={nv.detalles} rowKey={(_, i) => String(i)} columns={[
            { title: '#', width: 40, render: (_, __, i) => i + 1 },
            { title: 'Descripcion', dataIndex: 'descripcion' },
            { title: 'Und', dataIndex: 'unidad', width: 60 },
            { title: 'Cant.', dataIndex: 'cantidad', width: 70, align: 'right' },
            { title: 'Precio', dataIndex: 'precio_unitario', width: 100, align: 'right', render: (v: number) => formatMoney(v) },
            { title: 'Subtotal', width: 110, align: 'right', render: (_: unknown, r: NotaVentaDetalle) => <strong>{formatMoney(r.cantidad * r.precio_unitario)}</strong> },
          ] as import('antd/es/table').ColumnsType<NotaVentaDetalle>} />
          <div style={{ textAlign: 'right', marginTop: 12 }}><MoneyDisplay amount={nv.totales?.total ?? 0} strong size="large" /></div>
        </Card>
      </Space>
      <Modal title="Convertir Nota de Venta" open={convertModal} onCancel={() => setConvertModal(false)} footer={null}>
        <p>Seleccione tipo de documento:</p>
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" loading={convertMutation.isPending} onClick={() => handleConvert('01')}>Factura</Button>
          <Button type="primary" loading={convertMutation.isPending} onClick={() => handleConvert('03')}>Boleta</Button>
        </Space>
      </Modal>
    </div>
  );
}
