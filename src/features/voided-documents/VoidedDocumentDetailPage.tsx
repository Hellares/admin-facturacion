import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Space, Button, Table, Tag, message } from 'antd';
import { SendOutlined, SyncOutlined, FileTextOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import { showSendSunatConfirm } from '@/components/common/ConfirmModal';
import {
  useVoidedDocument,
  useSendVoidedDocumentToSunat,
} from './hooks/useVoidedDocuments';
import { voidedDocumentService } from '@/services/voided-document.service';
import { showApiError } from '@/lib/api-error';
import { downloadFile } from '@/utils/download';
import { formatDate } from '@/utils/format';
import type { VoidedDocItem } from '@/types/voided-document.types';

const TIPO_DOC_LABELS: Record<string, string> = {
  '01': 'Factura',
  '07': 'Nota de Credito',
  '08': 'Nota de Debito',
};

/**
 * Pagina de detalle de una Comunicacion de Baja (RA).
 * Muestra la info general y la lista de documentos que anula.
 */
export default function VoidedDocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: voided, isLoading, refetch } = useVoidedDocument(Number(id));
  const sendMutation = useSendVoidedDocumentToSunat();

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!voided) return <div>Comunicacion de baja no encontrada</div>;

  const handleSend = () => {
    showSendSunatConfirm(async () => {
      try {
        await sendMutation.mutateAsync(voided.id);
        message.success(`Comunicacion ${voided.numero_completo} enviada a SUNAT`);
        refetch();
      } catch (err) {
        showApiError(err, `Error al enviar ${voided.numero_completo}`);
        refetch();
      }
    }, voided.numero_completo);
  };

  const handleCheck = async () => {
    try {
      await voidedDocumentService.checkStatus(voided.id);
      message.success('Estado verificado');
      refetch();
    } catch (err) {
      showApiError(err, 'Error al verificar estado');
    }
  };

  const handleDownloadXml = async () => {
    try {
      await downloadFile(
        `/v1/voided-documents/${voided.id}/download-xml`,
        `${voided.numero_completo}.xml`
      );
    } catch (err) {
      showApiError(err, 'Error al descargar XML');
    }
  };

  const handleDownloadCdr = async () => {
    try {
      await downloadFile(
        `/v1/voided-documents/${voided.id}/download-cdr`,
        `CDR-${voided.numero_completo}.xml`
      );
    } catch (err) {
      showApiError(err, 'Error al descargar CDR');
    }
  };

  const docColumns: ColumnsType<VoidedDocItem> = [
    {
      title: 'Tipo',
      dataIndex: 'tipo_documento',
      width: 140,
      render: (t: string) => (
        <Tag color="blue">{TIPO_DOC_LABELS[t] || t}</Tag>
      ),
    },
    {
      title: 'Serie',
      dataIndex: 'serie',
      width: 100,
      render: (s: string) => <span style={{ fontFamily: 'monospace' }}>{s}</span>,
    },
    {
      title: 'Correlativo',
      dataIndex: 'correlativo',
      width: 120,
      render: (c: number | string) => (
        <span style={{ fontFamily: 'monospace' }}>
          {typeof c === 'number' ? String(c).padStart(8, '0') : c}
        </span>
      ),
    },
    {
      title: 'Motivo especifico',
      dataIndex: 'motivo_especifico',
      ellipsis: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Comunicacion de Baja ${voided.numero_completo}`}
        showBack
        breadcrumbs={[
          { title: 'Anulaciones', path: '/anulaciones' },
          { title: voided.numero_completo },
        ]}
        extra={
          <Space>
            {voided.estado_sunat === 'PENDIENTE' && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={sendMutation.isPending}
                onClick={handleSend}
              >
                Enviar a SUNAT
              </Button>
            )}
            {voided.estado_sunat === 'PROCESANDO' && (
              <Button icon={<SyncOutlined />} onClick={handleCheck}>
                Verificar Estado
              </Button>
            )}
            <Button icon={<FileTextOutlined />} onClick={handleDownloadXml}>
              XML
            </Button>
            {voided.estado_sunat === 'ACEPTADO' && (
              <Button icon={<CloudDownloadOutlined />} onClick={handleDownloadCdr}>
                CDR
              </Button>
            )}
          </Space>
        }
      />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card>
          <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
            <Descriptions.Item label="Identificador">
              <span style={{ fontFamily: 'monospace' }}>{voided.numero_completo}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Fecha Emision">
              {formatDate(voided.fecha_emision)}
            </Descriptions.Item>
            {voided.fecha_referencia && (
              <Descriptions.Item label="Fecha Referencia">
                {formatDate(voided.fecha_referencia)}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Estado SUNAT">
              <SunatStatusBadge
                status={voided.estado_sunat}
                sunatInfo={voided.respuesta_sunat}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Ticket">{voided.ticket || '-'}</Descriptions.Item>
            <Descriptions.Item label="Documentos Anulados">
              {voided.documentos?.length ?? 0}
            </Descriptions.Item>
            {voided.respuesta_sunat && (
              <Descriptions.Item label="Respuesta SUNAT" span={3}>
                {voided.respuesta_sunat}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card title="Documentos incluidos en la baja" size="small">
          <Table
            columns={docColumns}
            dataSource={voided.documentos || []}
            rowKey={(r, i) => `${r.tipo_documento}-${r.serie}-${r.correlativo}-${i}`}
            pagination={false}
            size="small"
            locale={{ emptyText: 'Sin documentos' }}
          />
        </Card>

        <div>
          <Button onClick={() => navigate('/anulaciones')}>Volver a Anulaciones</Button>
        </div>
      </Space>
    </div>
  );
}
