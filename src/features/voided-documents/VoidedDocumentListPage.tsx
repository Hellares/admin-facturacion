import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, message } from 'antd';
import { EyeOutlined, SendOutlined, SyncOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import DateCell from '@/components/common/DateCell';
import { showSendSunatConfirm } from '@/components/common/ConfirmModal';
import { useVoidedDocuments } from './hooks/useVoidedDocuments';
import { voidedDocumentService } from '@/services/voided-document.service';
import { useTableFilters } from '@/hooks/useTableFilters';
import { showApiError } from '@/lib/api-error';
import type { VoidedDocument } from '@/types/voided-document.types';
import type { SunatStatus } from '@/types/common.types';

export default function VoidedDocumentListPage() {
  const navigate = useNavigate();
  const { dateRange, setDateRange, page, perPage, handlePageChange, getQueryParams } = useTableFilters();

  const { data, isLoading, refetch } = useVoidedDocuments(getQueryParams());

  const handleSend = (record: VoidedDocument) => {
    showSendSunatConfirm(async () => {
      try {
        await voidedDocumentService.sendToSunat(record.id);
        message.success(`Comunicacion ${record.numero_completo} enviada`);
        refetch();
      } catch (err) {
        showApiError(err, `Error al enviar ${record.numero_completo}`);
        refetch();
      }
    }, record.numero_completo);
  };

  const handleCheck = async (id: number) => {
    try {
      await voidedDocumentService.checkStatus(id);
      message.success('Estado verificado');
      refetch();
    } catch (err) {
      showApiError(err, 'Error al verificar estado');
    }
  };

  const columns: ColumnsType<VoidedDocument> = [
    { title: 'Identificador', dataIndex: 'numero_completo', width: 260, render: (t: string) => <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{t}</span> },
    { title: 'Fecha', dataIndex: 'fecha_emision', width: 110, render: (d: string) => <DateCell value={d} /> },
    { title: 'Documentos', key: 'docs', width: 90, align: 'center', render: (_, r) => r.documentos?.length || 0 },
    { title: 'Estado', dataIndex: 'estado_sunat', width: 130, render: (s: SunatStatus, record: VoidedDocument) => <SunatStatusBadge status={s} sunatInfo={record.respuesta_sunat} /> },
    {
      title: 'Acciones', key: 'actions', width: 200,
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => navigate(`/voided-documents/${record.id}`)}>Ver</Button>
          {record.estado_sunat === 'PENDIENTE' && (
            <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => handleSend(record)}>Enviar</Button>
          )}
          {record.estado_sunat === 'PROCESANDO' && (
            <Button size="small" icon={<SyncOutlined />} onClick={() => handleCheck(record.id)}>Estado</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Comunicaciones de Baja"
        subtitle="Listado de Comunicaciones de Baja (RA) emitidas. Para crear una nueva, usa el boton 'Anular' en la lista de Facturas / NC / ND, o ve a la pagina de Anulaciones."
      />
      <Card>
        <div style={{ marginBottom: 16 }}><DateRangeFilter value={dateRange} onChange={setDateRange} /></div>
        <Table columns={columns} dataSource={data?.data} rowKey="id" loading={isLoading} pagination={{
          current: page, pageSize: perPage, total: data?.pagination?.total, onChange: handlePageChange, showSizeChanger: true,
        }} />
      </Card>
    </div>
  );
}
