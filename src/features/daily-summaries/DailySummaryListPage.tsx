import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Select, Modal, DatePicker, message } from 'antd';
import { EyeOutlined, SendOutlined, SyncOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import DateCell from '@/components/common/DateCell';
import EstadoBadge from '@/components/common/EstadoBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import { showSendSunatConfirm } from '@/components/common/ConfirmModal';
import { useDailySummaries, useSendDailySummaryToSunat, useCheckDailySummaryStatus, useCheckAllPending } from './hooks/useDailySummaries';
import { useTableFilters } from '@/hooks/useTableFilters';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { boletaService } from '@/services/boleta.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DailySummary } from '@/types/daily-summary.types';
import type { SunatStatus } from '@/types/common.types';
import { useState } from 'react';
import dayjs from '@/lib/dayjs';

export default function DailySummaryListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const { dateRange, setDateRange, page, perPage, handlePageChange, getQueryParams } = useTableFilters();
  const [statusFilter, setStatusFilter] = useState<SunatStatus | undefined>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const params = { ...getQueryParams(), estado_sunat: statusFilter };
  const { data, isLoading, refetch } = useDailySummaries(params);
  const sendMutation = useSendDailySummaryToSunat();
  const checkMutation = useCheckDailySummaryStatus();
  const checkAllMutation = useCheckAllPending();

  const selectedBranchId = useCompanyContextStore((s) => s.selectedBranchId);

  const createMutation = useMutation({
    mutationFn: (fecha: string) => boletaService.createDailySummary({
      company_id: selectedCompanyId!,
      branch_id: selectedBranchId!,
      fecha_resumen: fecha,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-summaries'] });
      message.success('Resumen diario creado exitosamente');
      setCreateModalOpen(false);
      refetch();
    },
    onError: () => message.error('Error al crear resumen. Verifique que haya boletas pendientes para esa fecha.'),
  });

  const handleSend = (record: DailySummary) => {
    showSendSunatConfirm(async () => {
      try {
        await sendMutation.mutateAsync(record.id);
        message.success(`Resumen ${record.numero_completo} enviado`);
        refetch();
      } catch { message.error('Error al enviar'); }
    }, record.numero_completo);
  };

  const handleCheck = async (id: number) => {
    try {
      await checkMutation.mutateAsync(id);
      message.success('Estado verificado');
      refetch();
    } catch { message.error('Error al verificar'); }
  };

  const handleCheckAll = async () => {
    try {
      await checkAllMutation.mutateAsync();
      message.success('Verificacion masiva completada');
      refetch();
    } catch { message.error('Error'); }
  };

  const columns: ColumnsType<DailySummary> = [
    { title: 'Identificador', dataIndex: 'numero_completo', width: 200, render: (t: string) => <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{t}</span> },
    { title: 'Fecha Resumen', dataIndex: 'fecha_resumen', width: 120, render: (d: string) => <DateCell value={d} /> },
    { title: 'Boletas', dataIndex: 'cantidad_boletas', width: 80, align: 'center' },
    { title: 'Total', dataIndex: 'total', width: 120, align: 'right', render: (m: number) => <MoneyDisplay amount={m} strong /> },
    { title: 'Proceso', dataIndex: 'estado_proceso', width: 110, render: (e: string) => <EstadoBadge estado={e} /> },
    { title: 'SUNAT', dataIndex: 'estado_sunat', width: 130, render: (s: SunatStatus, record: DailySummary) => <SunatStatusBadge status={s} sunatInfo={record.respuesta_sunat} /> },
    {
      title: 'Acciones', key: 'actions', width: 200,
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => navigate(`/daily-summaries/${record.id}`)}>Ver</Button>
          {record.estado_sunat === 'PENDIENTE' && (
            <Button size="small" type="primary" icon={<SendOutlined />} loading={sendMutation.isPending} onClick={() => handleSend(record)}>Enviar</Button>
          )}
          {(record.estado_sunat === 'PROCESANDO' || record.estado_proceso === 'ENVIADO') && (
            <Button size="small" icon={<SyncOutlined />} loading={checkMutation.isPending} onClick={() => handleCheck(record.id)}>Estado</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Resumenes Diarios"
        subtitle="Gestion de resumenes diarios de boletas"
        onAdd={() => setCreateModalOpen(true)}
        addLabel="Crear Resumen"
        extra={
          <Button icon={<ThunderboltOutlined />} loading={checkAllMutation.isPending} onClick={handleCheckAll}>
            Verificar Todos
          </Button>
        }
      />
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <Select allowClear placeholder="Estado SUNAT" style={{ width: 150 }} value={statusFilter} onChange={setStatusFilter} options={[
            { value: 'PENDIENTE', label: 'Pendiente' }, { value: 'PROCESANDO', label: 'Procesando' }, { value: 'ACEPTADO', label: 'Aceptado' }, { value: 'RECHAZADO', label: 'Rechazado' },
          ]} />
        </Space>
        <Table columns={columns} dataSource={data?.data} rowKey="id" loading={isLoading} scroll={{ x: 1000 }} pagination={{
          current: page, pageSize: perPage, total: data?.pagination?.total, onChange: handlePageChange, showSizeChanger: true, showTotal: (t) => `${t} resumenes`,
        }} />
      </Card>

      <Modal
        title="Crear Resumen Diario"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={() => createMutation.mutate(selectedDate.format('YYYY-MM-DD'))}
        confirmLoading={createMutation.isPending}
        okText="Crear Resumen"
      >
        <p style={{ marginBottom: 16 }}>
          Seleccione la fecha de emision de las boletas que desea agrupar en el resumen diario.
          Solo se incluiran boletas con metodo de envio "Resumen Diario" que esten en estado PENDIENTE.
        </p>
        <DatePicker
          value={selectedDate}
          onChange={(d) => d && setSelectedDate(d)}
          format="DD/MM/YYYY"
          style={{ width: '100%' }}
        />
        <p style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
          SUNAT permite enviar el resumen hasta 3 dias despues de la fecha de emision.
        </p>
      </Modal>
    </div>
  );
}
