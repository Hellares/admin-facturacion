import { useEffect, useState } from 'react';
import { Modal, Form, Input, Alert, Descriptions, Typography, Space, Tag, Button, message } from 'antd';
import { ExclamationCircleOutlined, CloudUploadOutlined } from '@ant-design/icons';
import dayjs from '@/lib/dayjs';
import {
  useCreateVoidedDocument,
  useSendVoidedDocumentToSunat,
} from '../hooks/useVoidedDocuments';
import { showApiError } from '@/lib/api-error';
import { formatDate, formatNumber } from '@/utils/format';
import type { SunatStatus } from '@/types/common.types';

const { Text, Paragraph } = Typography;

/**
 * Tipo de documento SUNAT (catalogo 01) soportados por Comunicacion de Baja.
 * Las boletas (03) se anulan via DailySummary, no via este dialog.
 */
export type TipoDocumentoAnulable = '01' | '07' | '08';

const TIPO_LABELS: Record<TipoDocumentoAnulable, string> = {
  '01': 'Factura',
  '07': 'Nota de Credito',
  '08': 'Nota de Debito',
};

/**
 * Info minima del documento a anular. Generico para Invoice, CreditNote, DebitNote.
 * Cada list page debe proveer estos campos al abrir el dialog.
 */
export interface AnulableDocumento {
  id: number;
  tipo_documento: TipoDocumentoAnulable;
  company_id: number;
  branch_id: number;
  numero_completo: string;
  serie: string;
  correlativo: string | number;
  fecha_emision: string;
  estado_sunat: SunatStatus;
  cliente?: {
    razon_social?: string;
    tipo_documento?: string;
    numero_documento?: string;
  };
  moneda?: string;
  total?: number;
}

interface AnularDocumentoDialogProps {
  doc: AnulableDocumento | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Dialog para anular una factura / nota de credito / nota de debito mediante
 * una Comunicacion de Baja (tipo RA). Es el equivalente para facturas/NC/ND
 * de lo que AnularBoletaDialog hace para boletas.
 *
 * Flujo:
 *   1. Usuario pulsa boton "Anular" en una fila de factura/NC/ND.
 *   2. Este dialog muestra la info del documento y pide motivo.
 *   3. Al confirmar, crea una VoidedDocument con un solo detalle via
 *      POST /v1/voided-documents.
 *   4. Cambia el footer a "Enviar a SUNAT" que llama
 *      POST /v1/voided-documents/{id}/send-sunat.
 *
 * Reglas SUNAT (validadas por backend, pre-validadas aqui):
 *   - estado_sunat debe ser ACEPTADO
 *   - Dentro de 7 dias calendario desde emision
 *   - No debe haber comunicacion de baja previa
 *   - Para facturas: NO debe tener NC/ND asociadas (backend rechaza)
 */
export default function AnularDocumentoDialog({
  doc,
  open,
  onClose,
  onSuccess,
}: AnularDocumentoDialogProps) {
  const [motivo, setMotivo] = useState('');
  const [voidedCreated, setVoidedCreated] = useState<{ id: number; numero_completo: string } | null>(null);

  const createMutation = useCreateVoidedDocument();
  const sendMutation = useSendVoidedDocumentToSunat();

  useEffect(() => {
    if (open) {
      setMotivo('');
      setVoidedCreated(null);
    }
  }, [open]);

  if (!doc) return null;

  const tipoLabel = TIPO_LABELS[doc.tipo_documento];
  const esAceptada = doc.estado_sunat === 'ACEPTADO';

  // Plazo SUNAT: 7 dias calendario para Comunicacion de Baja
  const diasTranscurridos = dayjs().diff(dayjs(doc.fecha_emision), 'day');
  const diasRestantes = Math.max(0, 7 - diasTranscurridos);
  const fueraDePlazo = esAceptada && diasTranscurridos > 7;
  const noAceptada = !esAceptada;

  const puedeAnular = !fueraDePlazo && !noAceptada;

  const loading = createMutation.isPending;

  const handleCrear = async () => {
    const motivoTrim = motivo.trim();
    if (motivoTrim.length === 0) {
      message.warning('Ingrese el motivo de anulacion');
      return;
    }
    if (motivoTrim.length > 250) {
      message.warning('El motivo no puede superar los 250 caracteres');
      return;
    }
    if (!puedeAnular) {
      message.error(
        fueraDePlazo
          ? 'El documento esta fuera del plazo de 7 dias'
          : 'Solo se pueden anular documentos aceptados por SUNAT'
      );
      return;
    }

    // El backend busca el documento en DB por (serie + correlativo) con comparacion
    // exacta de string. Por eso enviamos el correlativo TAL COMO viene del API
    // (tipicamente zero-padded a 6 digitos, ej. "000003"), sin aplicar padding
    // adicional porque eso romperia el match. El tipo TS dice number pero en
    // runtime es string, por eso hacemos String() defensivo.
    const correlativoStr = String(doc.correlativo).trim();

    try {
      const result = await createMutation.mutateAsync({
        company_id: doc.company_id,
        branch_id: doc.branch_id,
        fecha_referencia: dayjs(doc.fecha_emision).format('YYYY-MM-DD'),
        motivo_baja: motivoTrim,
        detalles: [
          {
            tipo_documento: doc.tipo_documento,
            serie: doc.serie,
            correlativo: correlativoStr,
            motivo_especifico: motivoTrim,
          },
        ],
      });
      message.success(`Comunicacion de baja ${result.numero_completo} creada`);
      setVoidedCreated({ id: result.id, numero_completo: result.numero_completo });
      // NO cerramos el dialog: ofrecemos el boton "Enviar a SUNAT" en el mismo flujo
    } catch (err) {
      showApiError(err, `Error al anular ${tipoLabel} ${doc.numero_completo}`);
    }
  };

  const handleEnviar = async () => {
    if (!voidedCreated) return;
    try {
      await sendMutation.mutateAsync(voidedCreated.id);
      message.success(`Comunicacion ${voidedCreated.numero_completo} enviada a SUNAT`);
      onSuccess?.();
      onClose();
    } catch (err) {
      showApiError(err, `Error al enviar ${voidedCreated.numero_completo}`);
      // Mantenemos el dialog abierto para permitir reintento
    }
  };

  const alertType = fueraDePlazo || noAceptada ? 'error' : diasRestantes <= 2 ? 'warning' : 'info';
  const alertMessage = noAceptada
    ? `Solo se pueden anular ${tipoLabel.toLowerCase()}s aceptadas por SUNAT`
    : fueraDePlazo
    ? 'FUERA DE PLAZO - No se puede anular oficialmente'
    : 'Anulacion via Comunicacion de Baja';

  const alertDescription = noAceptada ? (
    <Paragraph style={{ margin: 0 }}>
      El documento esta en estado <strong>{doc.estado_sunat}</strong>. SUNAT solo permite la
      Comunicacion de Baja de comprobantes que fueron previamente aceptados.
    </Paragraph>
  ) : fueraDePlazo ? (
    <Paragraph style={{ margin: 0 }}>
      Han pasado <strong>{diasTranscurridos} dias</strong> desde la emision. SUNAT solo permite
      anulacion via Comunicacion de Baja dentro de los <strong>7 dias</strong> posteriores a
      la emision. Este documento no puede anularse.
    </Paragraph>
  ) : (
    <Paragraph style={{ margin: 0 }}>
      Se generara una <strong>Comunicacion de Baja (tipo RA)</strong> con este documento.
      Dias restantes para anular: <strong>{diasRestantes}</strong>. Despues de crearla, puedes
      enviarla a SUNAT directamente desde este mismo dialog.
    </Paragraph>
  );

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          <span>Anular {tipoLabel} {doc.numero_completo}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={640}
      destroyOnHidden
      footer={
        voidedCreated ? (
          <Space>
            <Button onClick={onClose}>Cerrar</Button>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              loading={sendMutation.isPending}
              onClick={handleEnviar}
            >
              Enviar a SUNAT
            </Button>
          </Space>
        ) : (
          <Space>
            <Button onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button
              type="primary"
              danger
              loading={loading}
              onClick={handleCrear}
              disabled={!puedeAnular}
            >
              Anular {tipoLabel}
            </Button>
          </Space>
        )
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Tipo">{tipoLabel}</Descriptions.Item>
          <Descriptions.Item label="Numero">
            <Text code>{doc.numero_completo}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha Emision">
            {formatDate(doc.fecha_emision)}
          </Descriptions.Item>
          <Descriptions.Item label="Estado SUNAT">
            <Tag color={esAceptada ? 'green' : 'default'}>{doc.estado_sunat || 'PENDIENTE'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Cliente" span={2}>
            {doc.cliente?.razon_social || '-'}
            {doc.cliente?.numero_documento && (
              <Text type="secondary">
                {' '}
                ({doc.cliente.tipo_documento}-{doc.cliente.numero_documento})
              </Text>
            )}
          </Descriptions.Item>
          {doc.total != null && (
            <Descriptions.Item label="Total" span={2}>
              <Text strong>
                {doc.moneda || 'PEN'} {formatNumber(doc.total)}
              </Text>
            </Descriptions.Item>
          )}
        </Descriptions>

        <Alert type={alertType} showIcon message={alertMessage} description={alertDescription} />

        {voidedCreated && (
          <Alert
            type="success"
            showIcon
            message={`Comunicacion ${voidedCreated.numero_completo} creada correctamente`}
            description="Pulsa 'Enviar a SUNAT' para completar el proceso de anulacion, o 'Cerrar' si prefieres enviarla mas tarde desde la pagina de Anulaciones."
          />
        )}

        {!voidedCreated && (
          <Form layout="vertical">
            <Form.Item
              label="Motivo de anulacion"
              required
              help={`${motivo.length}/250 caracteres`}
            >
              <Input.TextArea
                placeholder="Ej: Error en el monto / Error en datos del cliente / Duplicado"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={250}
                rows={2}
                disabled={!puedeAnular}
              />
            </Form.Item>
          </Form>
        )}
      </Space>
    </Modal>
  );
}
