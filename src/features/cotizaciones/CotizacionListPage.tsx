import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Select, message } from 'antd';
import { EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import EstadoBadge from '@/components/common/EstadoBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import DateCell from '@/components/common/DateCell';
import { useCotizaciones } from './hooks/useCotizaciones';
import { useTableFilters } from '@/hooks/useTableFilters';
import { cotizacionService } from '@/services/cotizacion.service';
import type { Cotizacion, EstadoCotizacion } from '@/types/cotizacion.types';
import type { Moneda } from '@/types/common.types';

export default function CotizacionListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { search, setSearch, dateRange, setDateRange, page, perPage, handlePageChange, getQueryParams } = useTableFilters();
  const [estadoFilter, setEstadoFilter] = useState<EstadoCotizacion | undefined>();

  const params = { ...getQueryParams(), estado: estadoFilter };
  const { data, isLoading } = useCotizaciones(params);

  const marcarVencidasMut = useMutation({
    mutationFn: () => cotizacionService.marcarVencidas(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cotizaciones'] }); message.success('Cotizaciones vencidas marcadas'); },
    onError: () => message.error('Error al marcar cotizaciones vencidas'),
  });

  const columns: ColumnsType<Cotizacion> = [
    { title: 'Numero', dataIndex: 'numero_completo', width: 150, render: (t: string) => <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{t}</span> },
    { title: 'Fecha', dataIndex: 'fecha_emision', width: 110, render: (d: string) => <DateCell value={d} /> },
    { title: 'Validez', dataIndex: 'fecha_validez', width: 110, render: (d: string) => <DateCell value={d} /> },
    { title: 'Cliente', key: 'cliente', ellipsis: true, render: (_, r) => r.cliente?.razon_social },
    { title: 'Total', key: 'total', width: 120, align: 'right', render: (_: unknown, r: Cotizacion) => <MoneyDisplay amount={r.totales?.total ?? 0} moneda={r.moneda as Moneda} strong /> },
    { title: 'Estado', dataIndex: 'estado', width: 110, render: (e: string) => <EstadoBadge estado={e} /> },
    {
      title: 'Acciones', key: 'actions', width: 100,
      render: (_, record) => <Button size="small" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => navigate(`/cotizaciones/${record.id}`)}>Ver</Button>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Cotizaciones"
        subtitle="Proformas y presupuestos"
        onAdd={() => navigate('/cotizaciones/new')}
        addLabel="Nueva Cotizacion"
        extra={
          <Button icon={<ClockCircleOutlined />} onClick={() => marcarVencidasMut.mutate()} loading={marcarVencidasMut.isPending}>
            Marcar Vencidas
          </Button>
        }
      />
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar..." />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <Select allowClear placeholder="Estado" style={{ width: 140 }} value={estadoFilter} onChange={setEstadoFilter} options={[
            { value: 'borrador', label: 'Borrador' }, { value: 'enviada', label: 'Enviada' }, { value: 'aceptada', label: 'Aceptada' },
            { value: 'rechazada', label: 'Rechazada' }, { value: 'vencida', label: 'Vencida' }, { value: 'convertida', label: 'Convertida' },
          ]} />
        </Space>
        <Table columns={columns} dataSource={data?.data} rowKey="id" loading={isLoading} scroll={{ x: 900 }} pagination={{
          current: page, pageSize: perPage, total: data?.pagination?.total, onChange: handlePageChange, showSizeChanger: true,
        }} />
      </Card>
    </div>
  );
}
