import { Card, Table, Button, message, Tag } from 'antd';
import { CloudUploadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePendingSummaryDates, useCreateDailySummary, useCreateAllPendingSummaries } from '../hooks/useBoletas';
import { useCompanyContextStore } from '@/stores/company-context.store';
import DateCell from '@/components/common/DateCell';
import { formatDate, formatMoney } from '@/utils/format';
import { showConfirm } from '@/components/common/ConfirmModal';
import type { PendingSummaryDate } from '@/types/boleta.types';

export default function PendingSummariesPanel() {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const branchId = useCompanyContextStore((s) => s.selectedBranchId);
  const { data: pendingDates, isLoading } = usePendingSummaryDates();
  const createSummary = useCreateDailySummary();
  const createAll = useCreateAllPendingSummaries();

  const handleCreateSummary = (fecha: string) => {
    if (!companyId) return;
    showConfirm({
      title: 'Crear Resumen Diario',
      content: `¿Crear resumen diario para ${formatDate(fecha)}?`,
      onOk: async () => {
        try {
          await createSummary.mutateAsync({ company_id: companyId!, branch_id: branchId!, fecha_resumen: fecha });
          message.success(`Resumen diario para ${formatDate(fecha)} creado`);
        } catch {
          message.error('Error al crear resumen');
        }
      },
    });
  };

  const handleCreateAll = () => {
    if (!companyId) return;
    showConfirm({
      title: 'Crear Todos los Resumenes Pendientes',
      content: '¿Desea crear resumenes diarios para todas las fechas pendientes?',
      onOk: async () => {
        try {
          await createAll.mutateAsync(companyId);
          message.success('Resumenes diarios creados exitosamente');
        } catch {
          message.error('Error al crear resumenes');
        }
      },
    });
  };

  const columns: ColumnsType<PendingSummaryDate> = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      width: 110,
      render: (fecha: string) => <DateCell value={fecha} />,
    },
    {
      title: 'Boletas',
      dataIndex: 'cantidad',
      width: 80,
      render: (cant: number) => <Tag color="blue">{cant}</Tag>,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      width: 120,
      align: 'right',
      render: (total: number) => formatMoney(total),
    },
    {
      title: '',
      width: 120,
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          icon={<CloudUploadOutlined />}
          loading={createSummary.isPending}
          onClick={() => handleCreateSummary(record.fecha)}
        >
          Crear
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="Resumenes Diarios Pendientes"
      size="small"
      extra={
        pendingDates && pendingDates.length > 0 && (
          <Button
            type="primary"
            size="small"
            icon={<ThunderboltOutlined />}
            loading={createAll.isPending}
            onClick={handleCreateAll}
          >
            Crear Todos
          </Button>
        )
      }
    >
      <Table
        columns={columns}
        dataSource={pendingDates}
        rowKey="fecha"
        loading={isLoading}
        size="small"
        pagination={false}
        locale={{ emptyText: 'No hay resumenes pendientes' }}
      />
    </Card>
  );
}
