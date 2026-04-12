import { Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { SunatStatus } from '@/types/common.types';
import { SUNAT_STATUS_LABELS, SUNAT_STATUS_COLORS } from '@/utils/constants';

/**
 * Informacion resumida de la respuesta SUNAT (codigo + descripcion).
 * Se usa para mostrar tooltip con motivo del rechazo o error.
 *
 * Acepta tanto la estructura moderna `{ codigo, descripcion }` como
 * la leyenda simple (string) de algunos endpoints legacy.
 */
export interface SunatInfo {
  codigo?: string | number | null;
  descripcion?: string | null;
  notas?: string[] | null;
}

interface SunatStatusBadgeProps {
  status: SunatStatus;
  /**
   * Informacion opcional de SUNAT para mostrar en tooltip cuando el estado es
   * RECHAZADO o ERROR. Si esta presente y hay descripcion, el badge se envuelve
   * en un Tooltip con hover. Retrocompatible: sin prop funciona igual que antes.
   */
  sunatInfo?: SunatInfo | string | null;
}

function normalizeSunatInfo(info: SunatInfo | string | null | undefined): SunatInfo | null {
  if (!info) return null;
  if (typeof info === 'string') {
    return info.trim() ? { descripcion: info } : null;
  }
  if (!info.codigo && !info.descripcion) return null;
  return info;
}

export default function SunatStatusBadge({ status, sunatInfo }: SunatStatusBadgeProps) {
  if (!status) return <Tag color="default">-</Tag>;

  const color = SUNAT_STATUS_COLORS[status] || 'default';
  const label = SUNAT_STATUS_LABELS[status] || status;
  const normalized = normalizeSunatInfo(sunatInfo);
  const isProblem = status === 'RECHAZADO' || status === 'ERROR';

  // Solo mostramos tooltip cuando hay info y el estado es problematico
  const shouldShowTooltip = isProblem && normalized && normalized.descripcion;

  const badge = (
    <Tag color={color} style={{ cursor: shouldShowTooltip ? 'help' : 'default' }}>
      {label}
      {shouldShowTooltip && <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 11 }} />}
    </Tag>
  );

  if (!shouldShowTooltip) return badge;

  const codigoStr = normalized.codigo != null ? String(normalized.codigo) : '';
  const title = (
    <div style={{ maxWidth: 360 }}>
      {codigoStr && (
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          SUNAT {codigoStr}
        </div>
      )}
      <div style={{ whiteSpace: 'pre-wrap' }}>{normalized.descripcion}</div>
      {normalized.notas && normalized.notas.length > 0 && (
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          {normalized.notas.map((n, i) => (
            <div key={i}>• {n}</div>
          ))}
        </div>
      )}
    </div>
  );

  return <Tooltip title={title}>{badge}</Tooltip>;
}
