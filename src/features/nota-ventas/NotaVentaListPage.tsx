import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Select, message, Modal } from 'antd';
import { EyeOutlined, SwapOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import EstadoBadge from '@/components/common/EstadoBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import DateCell from '@/components/common/DateCell';
import { useNotaVentas, useConvertirNotaVenta } from './hooks/useNotaVentas';
import { useTableFilters } from '@/hooks/useTableFilters';
import type { NotaVenta, EstadoConversion } from '@/types/nota-venta.types';

export default function NotaVentaListPage() {
  const navigate = useNavigate();
  const { search, setSearch, dateRange, setDateRange, page, perPage, handlePageChange, getQueryParams } = useTableFilters();
  const [estadoFilter, setEstadoFilter] = useState<EstadoConversion | undefined>();
  const [convertModal, setConvertModal] = useState<{ visible: boolean; id: number; numero: string }>({ visible: false, id: 0, numero: '' });

  const params = { ...getQueryParams(), estado_conversion: estadoFilter };
  const { data, isLoading, refetch } = useNotaVentas(params);
  const convertMutation = useConvertirNotaVenta();

  const handleConvert = async (tipo: '01' | '03') => {
    try {
      await convertMutation.mutateAsync({ id: convertModal.id, data: { tipo_documento: tipo } });
      message.success(`Nota de venta convertida a ${tipo === '01' ? 'factura' : 'boleta'}`);
      setConvertModal({ visible: false, id: 0, numero: '' });
      refetch();
    } catch { message.error('Error al convertir'); }
  };

  const columns: ColumnsType<NotaVenta> = [
    { title: 'Numero', dataIndex: 'numero_completo', width: 150, render: (t: string) => <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{t}</span> },
    { title: 'Fecha', dataIndex: 'fecha_emision', width: 110, render: (d: string) => <DateCell value={d} /> },
    { title: 'Cliente', key: 'cliente', ellipsis: true, render: (_, r) => r.cliente?.razon_social },
    { title: 'Total', key: 'total', width: 120, align: 'right', render: (_: unknown, r: NotaVenta) => <MoneyDisplay amount={r.totales?.total ?? 0} strong /> },
    { title: 'Estado', dataIndex: 'estado_conversion', width: 120, render: (e: string) => <EstadoBadge estado={e} /> },
    {
      title: 'Convertido a', key: 'convertido', width: 150, responsive: ['lg'],
      render: (_, r) => r.documento_convertido_numero ? <span style={{ fontFamily: 'monospace' }}>{r.documento_convertido_numero}</span> : '-',
    },
    {
      title: 'Acciones', key: 'actions', width: 180,
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => navigate(`/nota-ventas/${record.id}`)}>Ver</Button>
          {record.estado_conversion === 'pendiente' && (
            <Button size="small" type="primary" icon={<SwapOutlined />} onClick={() => setConvertModal({ visible: true, id: record.id, numero: record.numero_completo })}>Convertir</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Notas de Venta" subtitle="Pre-documentos internos" onAdd={() => navigate('/nota-ventas/new')} addLabel="Nueva Nota" />
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar..." />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <Select allowClear placeholder="Estado" style={{ width: 140 }} value={estadoFilter} onChange={setEstadoFilter} options={[
            { value: 'pendiente', label: 'Pendiente' }, { value: 'convertida', label: 'Convertida' }, { value: 'anulada', label: 'Anulada' },
          ]} />
        </Space>
        <Table columns={columns} dataSource={data?.data} rowKey="id" loading={isLoading} scroll={{ x: 900 }} pagination={{
          current: page, pageSize: perPage, total: data?.pagination?.total, onChange: handlePageChange, showSizeChanger: true,
        }} />
      </Card>

      <Modal title={`Convertir ${convertModal.numero}`} open={convertModal.visible} onCancel={() => setConvertModal({ visible: false, id: 0, numero: '' })} footer={null}>
        <p>¿A que tipo de documento desea convertir esta nota de venta?</p>
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" loading={convertMutation.isPending} onClick={() => handleConvert('01')}>Factura</Button>
          <Button type="primary" loading={convertMutation.isPending} onClick={() => handleConvert('03')}>Boleta</Button>
        </Space>
      </Modal>
    </div>
  );
}
