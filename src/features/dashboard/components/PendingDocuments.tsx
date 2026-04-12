import { Card, Table, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import DateCell from '@/components/common/DateCell';
import type { PendingDocument } from '@/types/dashboard.types';
import type { SunatStatus } from '@/types/common.types';

interface PendingDocumentsProps {
  data: PendingDocument[] | undefined;
  loading: boolean;
}

const columns: ColumnsType<PendingDocument> = [
  {
    title: 'Documento',
    dataIndex: 'numero_completo',
    key: 'numero_completo',
    render: (text: string, record) => (
      <Space direction="vertical" size={0}>
        <span style={{ fontWeight: 500 }}>{text}</span>
        <span style={{ fontSize: 11, color: '#999' }}>{record.tipo}</span>
      </Space>
    ),
  },
  {
    title: 'Cliente',
    dataIndex: 'cliente',
    key: 'cliente',
    ellipsis: true,
  },
  {
    title: 'Monto',
    dataIndex: 'monto',
    key: 'monto',
    align: 'right',
    render: (monto: number) => <MoneyDisplay amount={monto} />,
  },
  {
    title: 'Fecha',
    dataIndex: 'fecha_emision',
    key: 'fecha_emision',
    width: 110,
    render: (date: string) => <DateCell value={date} />,
  },
  {
    title: 'Estado',
    dataIndex: 'estado_sunat',
    key: 'estado_sunat',
    render: (status: SunatStatus) => <SunatStatusBadge status={status} />,
  },
];

export default function PendingDocuments({ data, loading }: PendingDocumentsProps) {
  return (
    <Card title="Documentos Pendientes de Envio" size="small">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={false}
        scroll={{ y: 300 }}
        locale={{ emptyText: 'Sin documentos pendientes' }}
      />
    </Card>
  );
}
