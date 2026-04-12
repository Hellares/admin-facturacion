import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmOptions {
  title: string;
  content: string;
  onOk: () => void | Promise<void>;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function showConfirm({ title, content, onOk, okText = 'Confirmar', cancelText = 'Cancelar', danger = false }: ConfirmOptions) {
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText,
    cancelText,
    okButtonProps: { danger },
    onOk,
  });
}

export function showDeleteConfirm(onOk: () => void | Promise<void>, itemName = 'este registro') {
  showConfirm({
    title: 'Confirmar eliminacion',
    content: `¿Esta seguro que desea eliminar ${itemName}? Esta accion no se puede deshacer.`,
    onOk,
    okText: 'Eliminar',
    danger: true,
  });
}

export function showSendSunatConfirm(onOk: () => void | Promise<void>, docNumber: string) {
  showConfirm({
    title: 'Enviar a SUNAT',
    content: `¿Desea enviar el documento ${docNumber} a SUNAT? Esta accion no se puede revertir.`,
    onOk,
    okText: 'Enviar',
  });
}
