import { useEffect, useState } from 'react';
import { Modal, Form, Input, Alert, Descriptions, Typography, Space, Tag, Button, message } from 'antd';
import { ExclamationCircleOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import dayjs from '@/lib/dayjs';
import {
  useCreateVoidedDocument,
  useSendVoidedDocumentToSunat,
} from '../hooks/useVoidedDocuments';
import { creditNoteService } from '@/services/credit-note.service';
import { debitNoteService } from '@/services/debit-note.service';
import { dailySummaryService } from '@/services/daily-summary.service';
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
 *
 * Para NC/ND (tipo 07/08), tipo_doc_afectado='03' indica que esta vinculada a boleta:
 * el dialog rutea al endpoint de Resumen Diario (RC) en lugar de Comunicacion de Baja (RA).
 * SUNAT no acepta series con prefijo BC o BD en RA (error 2310).
 */
export interface AnulableDocumento {
  id: number;
  tipo_documento: TipoDocumentoAnulable;
  tipo_doc_afectado?: string; // '01' (factura) o '03' (boleta) para NC/ND
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
  const [docCreado, setDocCreado] = useState<{ id: number; numero_completo: string } | null>(null);

  const createMutation = useCreateVoidedDocument();
  const sendMutation = useSendVoidedDocumentToSunat();

  // Mutaciones para anulacion via Resumen Diario (NC/ND vinculadas a boleta)
  const anularNcMutation = useMutation({
    mutationFn: creditNoteService.anularOficialmente,
  });
  const anularNdMutation = useMutation({
    mutationFn: debitNoteService.anularOficialmente,
  });
  const sendSummaryMutation = useMutation({
    mutationFn: dailySummaryService.sendToSunat,
  });

  useEffect(() => {
    if (open) {
      setMotivo('');
      setDocCreado(null);
    }
  }, [open]);

  if (!doc) return null;

  const tipoLabel = TIPO_LABELS[doc.tipo_documento];
  const esAceptada = doc.estado_sunat === 'ACEPTADO';

  // Una NC/ND vinculada a boleta (tipo_doc_afectado=03) se anula via Resumen Diario,
  // no via Comunicacion de Baja. SUNAT no acepta series con prefijo BC o BD en RA.
  const esNotaDeBoleta =
    (doc.tipo_documento === '07' || doc.tipo_documento === '08') &&
    doc.tipo_doc_afectado === '03';

  // Plazo: 3 dias calendario para nota de boleta (RC), 7 para el resto (RA)
  const plazoMaximo = esNotaDeBoleta ? 3 : 7;
  const mecanismo = esNotaDeBoleta ? 'Resumen Diario' : 'Comunicacion de Baja';
  const mecanismoTipo = esNotaDeBoleta ? 'RC' : 'RA';

  const diasTranscurridos = dayjs().diff(dayjs(doc.fecha_emision), 'day');
  const diasRestantes = Math.max(0, plazoMaximo - diasTranscurridos);
  const fueraDePlazo = esAceptada && diasTranscurridos > plazoMaximo;
  const noAceptada = !esAceptada;

  const puedeAnular = !fueraDePlazo && !noAceptada;

  const loading =
    createMutation.isPending || anularNcMutation.isPending || anularNdMutation.isPending;
  const sending = sendMutation.isPending || sendSummaryMutation.isPending;

  const handleCrear = async () => {
    const motivoTrim = motivo.trim();
    if (motivoTrim.length === 0) {
      message.warning('Ingrese el motivo de anulacion');
      return;
    }
    if (motivoTrim.length > 100) {
      message.warning('El motivo no puede superar los 100 caracteres');
      return;
    }
    if (!puedeAnular) {
      message.error(
        fueraDePlazo
          ? `El documento esta fuera del plazo de ${plazoMaximo} dias`
          : 'Solo se pueden anular documentos aceptados por SUNAT'
      );
      return;
    }

    try {
      if (esNotaDeBoleta) {
        // Ruta nueva: NC/ND vinculada a boleta -> Resumen Diario
        const result =
          doc.tipo_documento === '07'
            ? await anularNcMutation.mutateAsync({
                company_id: doc.company_id,
                branch_id: doc.branch_id,
                nota_credito_ids: [doc.id],
                motivo_anulacion: motivoTrim,
              })
            : await anularNdMutation.mutateAsync({
                company_id: doc.company_id,
                branch_id: doc.branch_id,
                nota_debito_ids: [doc.id],
                motivo_anulacion: motivoTrim,
              });
        message.success(`Resumen ${result.summary.numero_completo} creado`);
        setDocCreado({ id: result.summary.id, numero_completo: result.summary.numero_completo });
      } else {
        // Ruta clasica: factura, NC de factura, ND de factura -> Comunicacion de Baja
        // El backend busca por (serie + correlativo) con comparacion exacta de string.
        const correlativoStr = String(doc.correlativo).trim();
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
        setDocCreado({ id: result.id, numero_completo: result.numero_completo });
      }
      // NO cerramos el dialog: ofrecemos el boton "Enviar a SUNAT" en el mismo flujo
    } catch (err) {
      showApiError(err, `Error al anular ${tipoLabel} ${doc.numero_completo}`);
    }
  };

  const handleEnviar = async () => {
    if (!docCreado) return;
    try {
      if (esNotaDeBoleta) {
        await sendSummaryMutation.mutateAsync(docCreado.id);
      } else {
        await sendMutation.mutateAsync(docCreado.id);
      }
      message.success(`${mecanismo} ${docCreado.numero_completo} enviada a SUNAT`);
      onSuccess?.();
      onClose();
    } catch (err) {
      showApiError(err, `Error al enviar ${docCreado.numero_completo}`);
      // Mantenemos el dialog abierto para permitir reintento
    }
  };

  const alertType = fueraDePlazo || noAceptada ? 'error' : diasRestantes <= 1 ? 'warning' : 'info';
  const alertMessage = noAceptada
    ? `Solo se pueden anular ${tipoLabel.toLowerCase()}s aceptadas por SUNAT`
    : fueraDePlazo
    ? 'FUERA DE PLAZO - No se puede anular oficialmente'
    : `Anulacion via ${mecanismo}`;

  const alertDescription = noAceptada ? (
    <Paragraph style={{ margin: 0 }}>
      El documento esta en estado <strong>{doc.estado_sunat}</strong>. SUNAT solo permite la
      anulacion de comprobantes que fueron previamente aceptados.
    </Paragraph>
  ) : fueraDePlazo ? (
    <Paragraph style={{ margin: 0 }}>
      Han pasado <strong>{diasTranscurridos} dias</strong> desde la emision. SUNAT solo permite
      anulacion oficial dentro de los <strong>{plazoMaximo} dias</strong> posteriores a la
      emision. Este documento no puede anularse.
    </Paragraph>
  ) : esNotaDeBoleta ? (
    <Paragraph style={{ margin: 0 }}>
      Esta nota esta vinculada a una <strong>boleta</strong>. SUNAT exige anularla con un{' '}
      <strong>Resumen Diario (tipo {mecanismoTipo})</strong>, no con Comunicacion de Baja.
      Dias restantes: <strong>{diasRestantes}</strong>. Despues de crear el resumen, puedes
      enviarlo a SUNAT desde este mismo dialog.
    </Paragraph>
  ) : (
    <Paragraph style={{ margin: 0 }}>
      Se generara una <strong>Comunicacion de Baja (tipo {mecanismoTipo})</strong> con este
      documento. Dias restantes para anular: <strong>{diasRestantes}</strong>. Despues de
      crearla, puedes enviarla a SUNAT directamente desde este mismo dialog.
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
        docCreado ? (
          <Space>
            <Button onClick={onClose}>Cerrar</Button>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              loading={sending}
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

        {docCreado && (
          <Alert
            type="success"
            showIcon
            message={`${mecanismo} ${docCreado.numero_completo} creado correctamente`}
            description={
              esNotaDeBoleta
                ? "Pulsa 'Enviar a SUNAT' para procesar el resumen, o 'Cerrar' si prefieres enviarlo mas tarde desde Anulaciones."
                : "Pulsa 'Enviar a SUNAT' para completar el proceso de anulacion, o 'Cerrar' si prefieres enviarlo mas tarde desde Anulaciones."
            }
          />
        )}

        {!docCreado && (
          <Form layout="vertical">
            <Form.Item
              label="Motivo de anulacion"
              required
              help={`${motivo.length}/100 caracteres`}
            >
              <Input.TextArea
                placeholder="Ej: Error en el monto / Error en datos del cliente / Duplicado"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={100}
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
