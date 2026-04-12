import { Tag } from 'antd';

const ESTADO_COLORS: Record<string, string> = {
  borrador: 'default',
  pendiente: 'orange',
  enviada: 'blue',
  aceptada: 'green',
  rechazada: 'red',
  convertida: 'purple',
  vencida: 'volcano',
  anulada: 'red',
  sin_anular: 'default',
  pendiente_anulacion: 'orange',
  completado: 'green',
  procesando: 'cyan',
  generado: 'blue',
  error: 'red',
};

interface EstadoBadgeProps {
  estado: string;
  label?: string;
}

export default function EstadoBadge({ estado, label }: EstadoBadgeProps) {
  if (!estado) return <Tag color="default">-</Tag>;
  const key = estado.toLowerCase();
  const color = ESTADO_COLORS[key] || 'default';
  const text = label || estado.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return <Tag color={color}>{text}</Tag>;
}
