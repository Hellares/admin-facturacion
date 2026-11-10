import { useState } from 'react';
import { Button, Form, Input, Modal, Space, Typography, message } from 'antd';
import { WhatsAppOutlined, SendOutlined } from '@ant-design/icons';
import apiClient from '@/lib/axios';
import { showApiError } from '@/lib/api-error';
import { formatMoney } from '@/utils/format';
import {
  linkPdfPublico, mensajeComprobante, normalizarCelular, urlWhatsApp, type TipoComprobante,
} from '@/utils/whatsapp';
import type { ClienteDocumento, EmpresaDocumento, Moneda, SunatStatus } from '@/types/common.types';

interface WhatsAppShareButtonProps {
  tipo: TipoComprobante;
  documentType: 'invoices' | 'boletas' | 'credit-notes' | 'debit-notes';
  documentId: number;
  numero: string;
  status: SunatStatus;
  empresa?: EmpresaDocumento;
  cliente?: ClienteDocumento;
  total?: number;
  moneda: Moneda;
}

/**
 * Envía el comprobante por WhatsApp.
 * - Empresa con WhatsApp conectado: el backend manda el PDF adjunto por Evolution API.
 * - Siempre: "Abrir WhatsApp" (wa.me) con el mensaje y el link de descarga, como respaldo.
 */
export default function WhatsAppShareButton({
  tipo, documentType, documentId, numero, status, empresa, cliente, total, moneda,
}: WhatsAppShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [celular, setCelular] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Solo comprobantes aceptados por SUNAT y con el RUC de la empresa para armar el link
  if (status !== 'ACEPTADO' || !empresa?.ruc) return null;

  const directo = !!empresa.whatsapp_directo;

  const abrir = () => {
    setCelular(cliente?.telefono ?? '');
    setMensaje(mensajeComprobante({
      cliente: cliente?.razon_social ?? '',
      empresa: empresa.nombre_comercial || empresa.razon_social || '',
      tipo,
      numero,
      total: formatMoney(total ?? 0, moneda),
      link: linkPdfPublico(window.location.origin, empresa.ruc, tipo, numero),
    }));
    setOpen(true);
  };

  const numeroValido = normalizarCelular(celular);

  const abrirWhatsApp = () => {
    if (!numeroValido) return;
    window.open(urlWhatsApp(numeroValido, mensaje), '_blank', 'noopener');
    setOpen(false);
  };

  const enviarDirecto = async () => {
    if (!numeroValido) return;
    setEnviando(true);
    try {
      await apiClient.post('/v1/whatsapp/enviar-documento', {
        tipo: documentType, id: documentId, celular: numeroValido, mensaje,
      });
      message.success(`${numero} enviado por WhatsApp`);
      setOpen(false);
    } catch (err) {
      showApiError(err, 'No se pudo enviar por WhatsApp');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Button icon={<WhatsAppOutlined />} style={{ color: '#128c4a' }} onClick={abrir}>
        WhatsApp
      </Button>
      <Modal
        title={`Enviar ${numero} por WhatsApp`}
        open={open}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        footer={
          <Space wrap>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              icon={<WhatsAppOutlined />}
              type={directo ? 'default' : 'primary'}
              disabled={!numeroValido}
              onClick={abrirWhatsApp}
            >
              Abrir WhatsApp
            </Button>
            {directo && (
              <Button type="primary" icon={<SendOutlined />} disabled={!numeroValido} loading={enviando} onClick={enviarDirecto}>
                Enviar con PDF
              </Button>
            )}
          </Space>
        }
      >
        <Form layout="vertical">
          <Form.Item
            label="Celular del cliente"
            validateStatus={celular && !numeroValido ? 'error' : ''}
            help={celular && !numeroValido ? 'Ingrese un celular de 9 dígitos (o con código de país)' : undefined}
          >
            <Input
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              placeholder="987654321"
              inputMode="tel"
              autoFocus
            />
          </Form.Item>
          <Form.Item label="Mensaje">
            <Input.TextArea value={mensaje} onChange={(e) => setMensaje(e.target.value)} autoSize={{ minRows: 5, maxRows: 10 }} />
          </Form.Item>
        </Form>
        <Typography.Text type="secondary">
          {directo
            ? '"Enviar con PDF" lo manda directo desde el WhatsApp de la empresa, con el PDF adjunto.'
            : 'Se abre WhatsApp con el mensaje listo; solo falta presionar enviar. El cliente descarga el PDF desde el link.'}
        </Typography.Text>
      </Modal>
    </>
  );
}
