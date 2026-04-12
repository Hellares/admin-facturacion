import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Tag, Segmented, Typography, Empty, Tooltip, message } from 'antd';
import { EyeOutlined, CloudUploadOutlined, SyncOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import DateCell from '@/components/common/DateCell';
import { showSendSunatConfirm } from '@/components/common/ConfirmModal';
import { useAnulaciones } from './hooks/useAnulaciones';
import {
  useSendDailySummaryToSunat,
  useCheckDailySummaryStatus,
} from '@/features/daily-summaries/hooks/useDailySummaries';
import {
  useSendVoidedDocumentToSunat,
  useCheckVoidedDocumentStatus,
} from '@/features/voided-documents/hooks/useVoidedDocuments';
import { showApiError } from '@/lib/api-error';
import type { AnulacionItem, AnulacionDocumento, TipoDocumentoAnulado } from './types';

const { Text } = Typography;

const TIPO_DOC_LABELS: Record<TipoDocumentoAnulado, string> = {
  '01': 'Factura',
  '03': 'Boleta',
  '07': 'N. Credito',
  '08': 'N. Debito',
};

const TIPO_DOC_COLORS: Record<TipoDocumentoAnulado, string> = {
  '01': 'blue',
  '03': 'cyan',
  '07': 'purple',
  '08': 'magenta',
};

/**
 * Pagina unificada de Anulaciones.
 *
 * Muestra en una sola tabla todas las anulaciones (tanto RC-estado3 para
 * boletas como RA/Comunicaciones de Baja para facturas/NC/ND), permitiendo
 * al operador ver la trazabilidad completa sin tener que recordar en que
 * modulo busca cada tipo.
 *
 * Cada fila enlaza al detalle nativo del documento (daily-summaries/{id}
 * o voided-documents/{id}) y permite acciones rapidas: enviar a SUNAT si
 * esta pendiente.
 */
export default function AnulacionesPage() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<'all' | 'boletas' | 'facturas'>('all');

  const { items, isLoading, refetch } = useAnulaciones({ tipo });

  const sendSummary = useSendDailySummaryToSunat();
  const sendVoided = useSendVoidedDocumentToSunat();
  const checkSummary = useCheckDailySummaryStatus();
  const checkVoided = useCheckVoidedDocumentStatus();

  const handleEnviar = (item: AnulacionItem) => {
    showSendSunatConfirm(async () => {
      try {
        if (item.origen === 'RC') {
          await sendSummary.mutateAsync(item.id);
        } else {
          await sendVoided.mutateAsync(item.id);
        }
        message.success(`${item.identificador} enviado a SUNAT`);
        refetch();
      } catch (err) {
        showApiError(err, `Error al enviar ${item.identificador}`);
        refetch();
      }
    }, item.identificador);
  };

  const handleVerificar = async (item: AnulacionItem) => {
    try {
      if (item.origen === 'RC') {
        await checkSummary.mutateAsync(item.id);
      } else {
        await checkVoided.mutateAsync(item.id);
      }
      message.success(`${item.identificador} estado actualizado`);
      refetch();
    } catch (err) {
      showApiError(err, `Error al verificar ${item.identificador}`);
      refetch();
    }
  };

  const columns: ColumnsType<AnulacionItem> = useMemo(
    () => [
      {
        title: 'Fecha',
        dataIndex: 'fecha',
        width: 110,
        render: (d: string) => <DateCell value={d} />,
      },
      {
        title: 'Tipo',
        dataIndex: 'origen',
        width: 110,
        render: (origen: 'RC' | 'RA') => (
          <Tag color={origen === 'RC' ? 'cyan' : 'blue'}>
            {origen === 'RC' ? 'RC · Boletas' : 'RA · Facturas'}
          </Tag>
        ),
      },
      {
        title: 'Identificador',
        dataIndex: 'identificador',
        width: 240,
        render: (id: string) => (
          <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{id}</span>
        ),
      },
      {
        title: 'Documentos Anulados',
        key: 'documentos',
        ellipsis: true,
        render: (_: unknown, record) => (
          <Space size={4} wrap>
            {record.documentos.slice(0, 4).map((doc: AnulacionDocumento, i: number) => (
              <Tooltip key={i} title={doc.motivo || undefined}>
                <Tag color={TIPO_DOC_COLORS[doc.tipo_documento] || 'default'}>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>
                    {TIPO_DOC_LABELS[doc.tipo_documento] || doc.tipo_documento}
                  </span>{' '}
                  {doc.numero}
                </Tag>
              </Tooltip>
            ))}
            {record.documentos.length > 4 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                +{record.documentos.length - 4} mas
              </Text>
            )}
          </Space>
        ),
      },
      {
        title: 'Cant.',
        dataIndex: 'cantidad_documentos',
        width: 70,
        align: 'center',
      },
      {
        title: 'Estado SUNAT',
        dataIndex: 'estado_sunat',
        width: 140,
        render: (status, record) => (
          <SunatStatusBadge status={status} sunatInfo={record.respuesta_sunat} />
        ),
      },
      {
        title: 'Acciones',
        key: 'actions',
        width: 220,
        render: (_: unknown, record) => (
          <Space size={4}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              style={{ color: '#1677ff' }}
              onClick={() => navigate(record.detalleRuta)}
            >
              Ver
            </Button>
            {record.estado_sunat === 'PENDIENTE' && (
              <Button
                size="small"
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={() => handleEnviar(record)}
                loading={sendSummary.isPending || sendVoided.isPending}
              >
                Enviar
              </Button>
            )}
            {(record.estado_sunat === 'ENVIADO' ||
              record.estado_sunat === 'ENVIANDO' ||
              record.estado_sunat === 'PROCESANDO') && (
              <Button
                size="small"
                icon={<SyncOutlined />}
                onClick={() => handleVerificar(record)}
                loading={checkSummary.isPending || checkVoided.isPending}
              >
                Actualizar
              </Button>
            )}
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendSummary.isPending, sendVoided.isPending, checkSummary.isPending, checkVoided.isPending]
  );

  return (
    <div>
      <PageHeader
        title="Anulaciones"
        subtitle="Registro unificado de anulaciones: boletas (Resumen Diario) y facturas/notas (Comunicacion de Baja)"
      />
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Segmented
            value={tipo}
            onChange={(v) => setTipo(v as typeof tipo)}
            options={[
              { label: `Todas (${items.length})`, value: 'all' },
              { label: 'Boletas (RC)', value: 'boletas' },
              { label: 'Facturas / NC / ND (RA)', value: 'facturas' },
            ]}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={items}
          rowKey={(r) => `${r.origen}-${r.id}`}
          loading={isLoading}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} anulaciones` }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                description="No hay anulaciones registradas para esta empresa"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>
    </div>
  );
}
