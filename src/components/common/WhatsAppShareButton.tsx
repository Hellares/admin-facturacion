import { useState } from 'react';
import { Button, Form, Input, Modal, Typography } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import { formatMoney } from '@/utils/format';
import {
  linkPdfPublico, mensajeComprobante, normalizarCelular, urlWhatsApp, type TipoComprobante,
} from '@/utils/whatsapp';
import type { ClienteDocumento, EmpresaDocumento, Moneda, SunatStatus } from '@/types/common.types';

interface WhatsAppShareButtonProps {
  tipo: TipoComprobante;
  numero: string;
  status: SunatStatus;
  empresa?: EmpresaDocumento;
  cliente?: ClienteDocumento;
  total?: number;
  moneda: Moneda;
}

/**
 * Abre WhatsApp (wa.me) con un mensaje listo y el link público de descarga del PDF.
 * wa.me no adjunta archivos: el cliente baja el PDF desde el link.
 */
export default function WhatsAppShareButton({ tipo, numero, status, empresa, cliente, total, moneda }: WhatsAppShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [celular, setCelular] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Solo comprobantes aceptados por SUNAT y con el RUC de la empresa para armar el link
  if (status !== 'ACEPTADO' || !empresa?.ruc) return null;

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

  const enviar = () => {
    if (!numeroValido) return;
    window.open(urlWhatsApp(numeroValido, mensaje), '_blank', 'noopener');
    setOpen(false);
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
        onOk={enviar}
        okText="Abrir WhatsApp"
        cancelText="Cancelar"
        okButtonProps={{ disabled: !numeroValido, icon: <WhatsAppOutlined /> }}
        destroyOnHidden
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
          Se abre WhatsApp con el mensaje listo; solo falta presionar enviar. El cliente descarga el PDF desde el link.
        </Typography.Text>
      </Modal>
    </>
  );
}
