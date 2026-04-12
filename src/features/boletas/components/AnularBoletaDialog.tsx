import { useEffect, useState } from 'react';
import { Modal, Form, Input, Alert, Descriptions, Typography, Space, Tag, Button, message } from 'antd';
import { ExclamationCircleOutlined, CloudUploadOutlined } from '@ant-design/icons';
import dayjs from '@/lib/dayjs';
import { useAnularBoletaLocalmente, useAnularBoletaOficialmente } from '../hooks/useBoletas';
import { useSendDailySummaryToSunat } from '@/features/daily-summaries/hooks/useDailySummaries';
import { showApiError } from '@/lib/api-error';
import { formatDate, formatNumber } from '@/utils/format';
import type { Boleta } from '@/types/boleta.types';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AnularBoletaDialogProps {
  boleta: Boleta | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Dialog para anular una sola boleta con motivo y campos requeridos por SUNAT.
 *
 * Detecta automaticamente el modo:
 *   - estado_sunat === 'ACEPTADO'  → ANULACION OFICIAL (crea Resumen Diario tipo RA)
 *   - cualquier otro estado         → ANULACION LOCAL (solo DB)
 *
 * Tras crear el resumen de anulacion oficial, ofrece un boton para enviarlo
 * inmediatamente a SUNAT sin tener que navegar al modulo de resumenes.
 */
export default function AnularBoletaDialog({
  boleta,
  open,
  onClose,
  onSuccess,
}: AnularBoletaDialogProps) {
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  // Tras crear el resumen oficial, guardamos id para ofrecer el envio a SUNAT
  const [summaryCreated, setSummaryCreated] = useState<{ id: number; numero: string } | null>(null);

  const anularLocal = useAnularBoletaLocalmente();
  const anularOficial = useAnularBoletaOficialmente();
  const sendSummary = useSendDailySummaryToSunat();

  // Reset form on open/close
  useEffect(() => {
    if (open) {
      setMotivo('');
      setObservaciones('');
      setSummaryCreated(null);
    }
  }, [open]);

  if (!boleta) return null;

  const esAceptada = boleta.estado_sunat === 'ACEPTADO';
  const modo: 'oficial' | 'local' = esAceptada ? 'oficial' : 'local';

  // Para la anulacion oficial, validamos plazo de 3 dias de frontend
  const diasTranscurridos = dayjs().diff(dayjs(boleta.fecha_emision), 'day');
  const fueraDePlazo = esAceptada && diasTranscurridos > 3;
  const diasRestantes = Math.max(0, 3 - diasTranscurridos);

  const loading = anularLocal.isPending || anularOficial.isPending;

  const handleSubmit = async () => {
    const motivoTrim = motivo.trim();
    if (motivoTrim.length === 0) {
      message.warning('Ingrese el motivo de anulacion');
      return;
    }
    if (motivoTrim.length > 100) {
      message.warning('El motivo no puede superar los 100 caracteres');
      return;
    }

    try {
      if (modo === 'oficial') {
        if (fueraDePlazo) {
          message.error('La boleta esta fuera del plazo de 3 dias. No se puede anular oficialmente.');
          return;
        }
        const result = await anularOficial.mutateAsync({
          company_id: boleta.company_id,
          branch_id: boleta.branch_id,
          boletas_ids: [boleta.id],
          motivo_anulacion: motivoTrim,
        });
        message.success(`Resumen de anulacion ${result.summary.numero_completo} creado correctamente.`);
        setSummaryCreated({ id: result.summary.id, numero: result.summary.numero_completo });
        // NO cerramos el dialog: ofrecemos el boton para enviar a SUNAT en el mismo flujo
      } else {
        await anularLocal.mutateAsync({
          boletas_ids: [boleta.id],
          motivo: motivoTrim,
          observaciones: observaciones.trim() || undefined,
        });
        message.success(`Boleta ${boleta.numero_completo} anulada localmente.`);
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      showApiError(err, 'Error al anular boleta');
    }
  };

  const handleSendSummaryToSunat = async () => {
    if (!summaryCreated) return;
    try {
      await sendSummary.mutateAsync(summaryCreated.id);
      message.success(`Resumen ${summaryCreated.numero} enviado a SUNAT`);
      onSuccess?.();
      onClose();
    } catch (err) {
      showApiError(err, `Error al enviar resumen ${summaryCreated.numero}`);
      // Mantenemos el dialog abierto para que vea el error y pueda reintentar
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          <span>Anular Boleta {boleta.numero_completo}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={640}
      destroyOnHidden
      footer={
        summaryCreated ? (
          <Space>
            <Button onClick={onClose}>Cerrar</Button>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              loading={sendSummary.isPending}
              onClick={handleSendSummaryToSunat}
            >
              Enviar Resumen a SUNAT
            </Button>
          </Space>
        ) : (
          <Space>
            <Button onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button
              type="primary"
              danger
              loading={loading}
              onClick={handleSubmit}
              disabled={fueraDePlazo}
            >
              {modo === 'oficial' ? 'Anular Oficialmente' : 'Anular Localmente'}
            </Button>
          </Space>
        )
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Info de la boleta */}
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Numero">
            <Text code>{boleta.numero_completo}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha Emision">
            {formatDate(boleta.fecha_emision)}
          </Descriptions.Item>
          <Descriptions.Item label="Cliente" span={2}>
            {boleta.cliente?.razon_social || '-'}
            {boleta.cliente?.numero_documento && (
              <Text type="secondary"> ({boleta.cliente.tipo_documento}-{boleta.cliente.numero_documento})</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Total">
            <Text strong>{boleta.moneda} {formatNumber(boleta.totales?.total ?? boleta.mto_imp_venta ?? 0)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Estado SUNAT">
            <Tag color={esAceptada ? 'green' : 'default'}>{boleta.estado_sunat || 'PENDIENTE'}</Tag>
          </Descriptions.Item>
        </Descriptions>

        {/* Alert segun el modo */}
        {modo === 'oficial' ? (
          <Alert
            type={fueraDePlazo ? 'error' : diasRestantes <= 1 ? 'warning' : 'info'}
            showIcon
            message={
              fueraDePlazo
                ? 'FUERA DE PLAZO - No se puede anular oficialmente'
                : 'Anulacion Oficial ante SUNAT'
            }
            description={
              fueraDePlazo ? (
                <Paragraph style={{ margin: 0 }}>
                  Han pasado <strong>{diasTranscurridos} dias</strong> desde la emision. SUNAT solo
                  permite anulacion oficial dentro de los <strong>3 dias</strong> posteriores a la
                  emision de la boleta. Esta boleta no puede anularse.
                </Paragraph>
              ) : (
                <Paragraph style={{ margin: 0 }}>
                  Se generara un <strong>Resumen Diario de Anulacion (tipo RA)</strong> con esta
                  boleta. Dias restantes para anular: <strong>{diasRestantes}</strong>.
                  Despues de crearlo, puedes enviarlo a SUNAT directamente desde este mismo dialog.
                </Paragraph>
              )
            }
          />
        ) : (
          <Alert
            type="info"
            showIcon
            message="Anulacion Local"
            description="La boleta NO fue aceptada por SUNAT, por lo tanto solo se marcara como anulada en la base de datos local. SUNAT no sera notificada."
          />
        )}

        {/* Confirmacion: resumen creado, listo para enviar */}
        {summaryCreated && (
          <Alert
            type="success"
            showIcon
            message={`Resumen ${summaryCreated.numero} creado correctamente`}
            description="Pulsa 'Enviar Resumen a SUNAT' para completar el proceso de anulacion oficial, o 'Cerrar' si prefieres enviarlo mas tarde desde el modulo de Resumenes Diarios."
          />
        )}

        {/* Form fields — solo visibles antes de crear el resumen */}
        {!summaryCreated && (
          <Form layout="vertical">
            <Form.Item
              label="Motivo de anulacion"
              required
              help={`${motivo.length}/100 caracteres`}
            >
              <Input
                placeholder="Ej: Error en el monto / Cliente equivocado / Cancelacion de la venta"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={100}
                disabled={fueraDePlazo}
              />
            </Form.Item>

            {modo === 'local' && (
              <Form.Item label="Observaciones (opcional)">
                <TextArea
                  placeholder="Detalles adicionales de la anulacion"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  maxLength={500}
                  rows={3}
                  showCount
                />
              </Form.Item>
            )}
          </Form>
        )}
      </Space>
    </Modal>
  );
}
