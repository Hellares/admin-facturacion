import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Space, Button, Modal, Input, Divider, message } from 'antd';
import { SendOutlined, CheckOutlined, CloseOutlined, SwapOutlined, CopyOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EstadoBadge from '@/components/common/EstadoBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import { useCotizacion, useEnviarCotizacion, useAceptarCotizacion, useRechazarCotizacion, useConvertirCotizacion, useDuplicarCotizacion } from './hooks/useCotizaciones';
import { formatDate, formatMoney } from '@/utils/format';
import { calculateItemTotals } from '@/utils/tax-calculator';
import { openPdfInNewTab } from '@/utils/download';
import type { DetalleItem, Moneda } from '@/types/common.types';

export default function CotizacionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: cot, isLoading, refetch } = useCotizacion(Number(id));
  const enviarMut = useEnviarCotizacion();
  const aceptarMut = useAceptarCotizacion();
  const rechazarMut = useRechazarCotizacion();
  const convertirMut = useConvertirCotizacion();
  const duplicarMut = useDuplicarCotizacion();
  const [rejectModal, setRejectModal] = useState(false);
  const [convertModal, setConvertModal] = useState(false);
  const [rejectMotivo, setRejectMotivo] = useState('');

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!cot) return <div>Cotizacion no encontrada</div>;

  const moneda = cot.moneda as Moneda;
  const estado = cot.estado;

  const handleAction = async (action: () => Promise<unknown>, successMsg: string) => {
    try { await action(); message.success(successMsg); refetch(); } catch { message.error('Error'); }
  };

  const itemCols: ColumnsType<DetalleItem> = [
    { title: '#', width: 40, render: (_, __, i) => i + 1 },
    { title: 'Descripcion', dataIndex: 'descripcion', ellipsis: true },
    { title: 'Cant.', dataIndex: 'cantidad', width: 70, align: 'right' },
    { title: 'P. Unit.', width: 100, align: 'right', render: (_, r) => formatMoney(calculateItemTotals(r).mto_precio_unitario, moneda) },
    { title: 'IGV', width: 90, align: 'right', render: (_, r) => formatMoney(calculateItemTotals(r).igv, moneda) },
    { title: 'Total', width: 110, align: 'right', render: (_, r) => <strong>{formatMoney(calculateItemTotals(r).total_item, moneda)}</strong> },
  ];

  return (
    <div>
      <PageHeader
        title={`Cotizacion ${cot.numero_completo}`} showBack
        breadcrumbs={[{ title: 'Cotizaciones', path: '/cotizaciones' }, { title: cot.numero_completo }]}
        extra={
          <Space wrap>
            {estado === 'borrador' && <Button type="primary" icon={<SendOutlined />} loading={enviarMut.isPending} onClick={() => handleAction(() => enviarMut.mutateAsync(cot.id), 'Cotizacion enviada')}>Enviar</Button>}
            {estado === 'enviada' && <Button type="primary" icon={<CheckOutlined />} loading={aceptarMut.isPending} onClick={() => handleAction(() => aceptarMut.mutateAsync(cot.id), 'Cotizacion aceptada')}>Aceptar</Button>}
            {estado === 'enviada' && <Button danger icon={<CloseOutlined />} onClick={() => setRejectModal(true)}>Rechazar</Button>}
            {estado === 'aceptada' && <Button type="primary" icon={<SwapOutlined />} onClick={() => setConvertModal(true)}>Convertir</Button>}
            <Button icon={<CopyOutlined />} loading={duplicarMut.isPending} onClick={() => handleAction(async () => { const d = await duplicarMut.mutateAsync(cot.id); navigate(`/cotizaciones/${d.id}`); }, 'Duplicada')}>Duplicar</Button>
            <Button icon={<FilePdfOutlined />} onClick={() => openPdfInNewTab(`/v1/cotizaciones/${cot.id}/download-pdf`).catch(() => message.error('Error'))}>PDF</Button>
          </Space>
        }
      />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card>
          <Descriptions column={{ xs: 1, sm: 2, lg: 4 }}>
            <Descriptions.Item label="Numero">{cot.numero_completo}</Descriptions.Item>
            <Descriptions.Item label="Fecha">{formatDate(cot.fecha_emision)}</Descriptions.Item>
            <Descriptions.Item label="Validez">{formatDate(cot.fecha_validez)} ({cot.dias_validez} dias)</Descriptions.Item>
            <Descriptions.Item label="Estado"><EstadoBadge estado={estado} /></Descriptions.Item>
            <Descriptions.Item label="Moneda">{cot.moneda}</Descriptions.Item>
            <Descriptions.Item label="Forma Pago">{cot.forma_pago_tipo}</Descriptions.Item>
            {cot.contacto_cliente && <Descriptions.Item label="Contacto">{cot.contacto_cliente}</Descriptions.Item>}
            {cot.motivo_rechazo && <Descriptions.Item label="Motivo Rechazo" span={4}>{cot.motivo_rechazo}</Descriptions.Item>}
          </Descriptions>
        </Card>
        <Card title="Cliente" size="small">
          <Descriptions column={3}>
            <Descriptions.Item label="Documento">{cot.cliente?.tipo_documento} - {cot.cliente?.numero_documento}</Descriptions.Item>
            <Descriptions.Item label="Razon Social">{cot.cliente?.razon_social}</Descriptions.Item>
            <Descriptions.Item label="Direccion">{cot.cliente?.direccion || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="Items" size="small">
          <Table columns={itemCols} dataSource={cot.detalles} rowKey={(_, i) => String(i)} size="small" pagination={false} />
        </Card>
        <Card title="Totales" size="small" style={{ maxWidth: 400, marginLeft: 'auto' }}>
          <Descriptions column={1} size="small" colon={false}>
            {(cot.totales?.mto_oper_gravadas ?? 0) > 0 && <Descriptions.Item label="Op. Gravadas">{formatMoney(cot.totales?.mto_oper_gravadas ?? 0, moneda)}</Descriptions.Item>}
            <Descriptions.Item label="IGV">{formatMoney(cot.totales?.mto_igv ?? 0, moneda)}</Descriptions.Item>
            <Divider style={{ margin: '4px 0' }} />
            <Descriptions.Item label={<strong>TOTAL</strong>}><MoneyDisplay amount={cot.totales?.mto_imp_venta ?? 0} moneda={moneda} strong size="large" /></Descriptions.Item>
          </Descriptions>
        </Card>
        {cot.condiciones && <Card title="Condiciones" size="small"><p>{cot.condiciones}</p></Card>}
        {cot.notas && <Card title="Notas" size="small"><p>{cot.notas}</p></Card>}
      </Space>

      <Modal title="Rechazar Cotizacion" open={rejectModal} onCancel={() => setRejectModal(false)} onOk={async () => {
        await handleAction(() => rechazarMut.mutateAsync({ id: cot.id, motivo: rejectMotivo }), 'Cotizacion rechazada');
        setRejectModal(false);
      }} okText="Rechazar" okButtonProps={{ danger: true }}>
        <Input.TextArea value={rejectMotivo} onChange={(e) => setRejectMotivo(e.target.value)} placeholder="Motivo de rechazo (opcional)" rows={3} />
      </Modal>

      <Modal title="Convertir Cotizacion" open={convertModal} onCancel={() => setConvertModal(false)} footer={null}>
        <p>Seleccione tipo de documento:</p>
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" loading={convertirMut.isPending} onClick={() => handleAction(async () => { await convertirMut.mutateAsync({ id: cot.id, tipo: 'invoice' }); setConvertModal(false); }, 'Convertida a factura')}>Factura</Button>
          <Button type="primary" loading={convertirMut.isPending} onClick={() => handleAction(async () => { await convertirMut.mutateAsync({ id: cot.id, tipo: 'boleta' }); setConvertModal(false); }, 'Convertida a boleta')}>Boleta</Button>
        </Space>
      </Modal>
    </div>
  );
}
