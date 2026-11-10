import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tag, Space, Alert, Button } from 'antd';
import { StopOutlined, LinkOutlined, FileExclamationOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import OrigenTag from '@/components/common/OrigenTag';
import EstadoBadge from '@/components/common/EstadoBadge';
import DocumentActions from '@/components/common/DocumentActions';
import WhatsAppShareButton from '@/components/common/WhatsAppShareButton';
import DocumentPdfViewer from '@/components/common/DocumentPdfViewer';
import ComprobanteDetalle from '@/components/common/ComprobanteDetalle';
import { useBoleta } from './hooks/useBoletas';
import { useDocumentAnulacionInfo } from '@/hooks/useDocumentAnulacionInfo';
import { formatMoney } from '@/utils/format';
import type { Moneda } from '@/types/common.types';

export default function BoletaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: boleta, isLoading, refetch } = useBoleta(Number(id));
  const [pdfOpen, setPdfOpen] = useState(false);
  const { info: anulacionInfo, isLocalAnulacion, localMotivo } =
    useDocumentAnulacionInfo(boleta);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!boleta) return <div>Boleta no encontrada</div>;

  const moneda = boleta.moneda as Moneda;


  const acciones = (
    <Space wrap>
      <DocumentActions
        documentType="boletas"
        documentId={boleta.id}
        documentNumber={boleta.numero_completo}
        status={boleta.estado_sunat}
        sunatCode={boleta.sunat?.codigo}
        onStatusChange={() => refetch()}
        onViewPdf={() => setPdfOpen(true)}
      />
      <WhatsAppShareButton
        tipo="03"
        documentType="boletas"
        documentId={boleta.id}
        numero={boleta.numero_completo}
        status={boleta.estado_sunat}
        empresa={boleta.empresa}
        cliente={boleta.cliente}
        total={boleta.totales?.total ?? boleta.mto_imp_venta}
        moneda={moneda}
      />
    </Space>
  );

  const avisos = (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Banner de anulacion oficial via Resumen Diario (RC) */}
        {anulacionInfo && (
          <Alert
            type="error"
            showIcon
            icon={<StopOutlined />}
            message={
              <Space wrap size="small">
                <strong>BOLETA ANULADA</strong>
                <span>Resumen de Anulacion:</span>
                <Tag color="red" style={{ fontFamily: 'monospace', margin: 0 }}>
                  {anulacionInfo.numero_completo}
                </Tag>
                <SunatStatusBadge status={anulacionInfo.estado_sunat} />
                <Button
                  size="small"
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => navigate(anulacionInfo.detailRoute)}
                >
                  Ver detalle
                </Button>
              </Space>
            }
            description={
              anulacionInfo.motivo ? <span style={{ fontSize: 12 }}>Motivo: {anulacionInfo.motivo}</span> : undefined
            }
          />
        )}

        {/* Banner de anulacion local (no notificada a SUNAT) */}
        {isLocalAnulacion && !anulacionInfo && (
          <Alert
            type="warning"
            showIcon
            icon={<StopOutlined />}
            message="Boleta anulada localmente (no notificada a SUNAT)"
            description={localMotivo ? `Motivo: ${localMotivo}` : undefined}
          />
        )}

        {/* Notas de credito asociadas (serie BC*) */}
        {boleta.credit_notes && boleta.credit_notes.length > 0 && boleta.credit_notes.map((nc) => (
          <Alert
            key={`nc-${nc.id}`}
            type="warning"
            showIcon
            icon={<FileExclamationOutlined />}
            message={
              <Space wrap size="small">
                <strong>NOTA DE CREDITO</strong>
                <Tag color="orange" style={{ fontFamily: 'monospace', margin: 0 }}>{nc.numero_completo}</Tag>
                <SunatStatusBadge status={nc.estado_sunat as import('@/types/common.types').SunatStatus} />
                <span style={{ fontSize: 12, color: '#666' }}>{nc.motivo}</span>
                <Tag>{formatMoney(nc.total, nc.moneda as Moneda)}</Tag>
                <Button size="small" type="link" icon={<LinkOutlined />} onClick={() => navigate(`/credit-notes/${nc.id}`)}>
                  Ver detalle
                </Button>
              </Space>
            }
          />
        ))}

        {/* Notas de debito asociadas (serie BD*) */}
        {boleta.debit_notes && boleta.debit_notes.length > 0 && boleta.debit_notes.map((nd) => (
          <Alert
            key={`nd-${nd.id}`}
            type="info"
            showIcon
            icon={<ExclamationCircleOutlined />}
            message={
              <Space wrap size="small">
                <strong>NOTA DE DEBITO</strong>
                <Tag color="blue" style={{ fontFamily: 'monospace', margin: 0 }}>{nd.numero_completo}</Tag>
                <SunatStatusBadge status={nd.estado_sunat as import('@/types/common.types').SunatStatus} />
                <span style={{ fontSize: 12, color: '#666' }}>{nd.motivo}</span>
                <Tag>{formatMoney(nd.total, nd.moneda as Moneda)}</Tag>
                <Button size="small" type="link" icon={<LinkOutlined />} onClick={() => navigate(`/debit-notes/${nd.id}`)}>
                  Ver detalle
                </Button>
              </Space>
            }
          />
        ))}

      </Space>
  );

  return (
    <div>
      <ComprobanteDetalle
        tipoNombre="Boleta de venta electrónica"
        numero={boleta.numero_completo}
        volver={{ label: 'Boletas', path: '/boletas' }}
        fechaEmision={boleta.fecha_emision}
        creadoEn={boleta.created_at}
        actualizadoEn={boleta.updated_at}
        moneda={moneda}
        formaPago={boleta.forma_pago?.tipo}
        cliente={boleta.cliente}
        detalles={boleta.detalles}
        totales={boleta.totales}
        estado={boleta.estado_sunat}
        anulado={!!anulacionInfo || isLocalAnulacion}
        respuestaSunat={boleta.sunat?.descripcion}
        hash={boleta.hash}
        acciones={acciones}
        avisos={avisos}
        datos={[
          { label: 'Origen', value: <OrigenTag origen={boleta.origen} size="default" /> },
          { label: 'Envío a SUNAT', value: boleta.metodo_envio === 'individual' ? 'Individual' : 'Resumen diario' },
          { label: 'Anulación', value: <EstadoBadge estado={boleta.estado_anulacion} /> },
          { label: 'Notas', value: (boleta.credit_notes?.length ?? 0) + (boleta.debit_notes?.length ?? 0) || 'Ninguna' },
        ]}
      />

      <DocumentPdfViewer
        documentType="boletas"
        documentId={boleta.id}
        documentNumber={boleta.numero_completo}
        estadoSunat={boleta.estado_sunat}
        sunatInfo={boleta.sunat ?? boleta.respuesta_sunat}
        sourceDocument={boleta}
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
      />
    </div>
  );
}
