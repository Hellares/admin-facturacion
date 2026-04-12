import { useParams } from 'react-router-dom';
import { Card, Descriptions, Space, Button, message } from 'antd';
import { SendOutlined, SyncOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import EstadoBadge from '@/components/common/EstadoBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import { useDailySummary, useSendDailySummaryToSunat, useCheckDailySummaryStatus } from './hooks/useDailySummaries';
import { showSendSunatConfirm } from '@/components/common/ConfirmModal';
import { formatDate } from '@/utils/format';
import { downloadFile } from '@/utils/download';

export default function DailySummaryDetailPage() {
  const { id } = useParams();
  const { data: summary, isLoading, refetch } = useDailySummary(Number(id));
  const sendMutation = useSendDailySummaryToSunat();
  const checkMutation = useCheckDailySummaryStatus();

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!summary) return <div>Resumen no encontrado</div>;

  const handleSend = () => {
    showSendSunatConfirm(async () => {
      try {
        await sendMutation.mutateAsync(summary.id);
        message.success('Resumen enviado a SUNAT');
        refetch();
      } catch { message.error('Error al enviar'); }
    }, summary.numero_completo);
  };

  const handleCheck = async () => {
    try {
      await checkMutation.mutateAsync(summary.id);
      message.success('Estado verificado');
      refetch();
    } catch { message.error('Error'); }
  };

  return (
    <div>
      <PageHeader
        title={`Resumen ${summary.numero_completo}`}
        showBack
        breadcrumbs={[{ title: 'Resumenes Diarios', path: '/daily-summaries' }, { title: summary.numero_completo }]}
        extra={
          <Space>
            {summary.estado_sunat === 'PENDIENTE' && (
              <Button type="primary" icon={<SendOutlined />} loading={sendMutation.isPending} onClick={handleSend}>Enviar a SUNAT</Button>
            )}
            {(summary.estado_sunat === 'PROCESANDO' || summary.estado_proceso === 'ENVIADO') && (
              <Button icon={<SyncOutlined />} loading={checkMutation.isPending} onClick={handleCheck}>Verificar Estado</Button>
            )}
            <Button onClick={() => downloadFile(`/v1/daily-summaries/${summary.id}/download-xml`, `${summary.numero_completo}.xml`).catch(() => message.error('Error'))}>XML</Button>
            {summary.estado_sunat === 'ACEPTADO' && (
              <Button onClick={() => downloadFile(`/v1/daily-summaries/${summary.id}/download-cdr`, `CDR-${summary.numero_completo}.xml`).catch(() => message.error('Error'))}>CDR</Button>
            )}
          </Space>
        }
      />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card>
          <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
            <Descriptions.Item label="Identificador">{summary.numero_completo}</Descriptions.Item>
            <Descriptions.Item label="Fecha Resumen">{formatDate(summary.fecha_resumen)}</Descriptions.Item>
            <Descriptions.Item label="Fecha Generacion">{formatDate(summary.fecha_generacion)}</Descriptions.Item>
            <Descriptions.Item label="Estado Proceso"><EstadoBadge estado={summary.estado_proceso} /></Descriptions.Item>
            <Descriptions.Item label="Estado SUNAT"><SunatStatusBadge status={summary.estado_sunat} /></Descriptions.Item>
            <Descriptions.Item label="Ticket">{summary.ticket || '-'}</Descriptions.Item>
            <Descriptions.Item label="Cantidad Boletas">{summary.cantidad_boletas}</Descriptions.Item>
            <Descriptions.Item label="Total"><MoneyDisplay amount={summary.total} strong size="large" /></Descriptions.Item>
            {summary.respuesta_sunat && <Descriptions.Item label="Respuesta SUNAT" span={3}>{summary.respuesta_sunat}</Descriptions.Item>}
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
}
