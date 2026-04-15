import { Badge, Tooltip, Button } from 'antd';
import { BellOutlined, BellFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { usePlazoAlertsSummary } from '@/hooks/usePlazoAlertsSummary';
import { ROUTES } from '@/config/routes.config';

export default function PlazoAlertsBell() {
  const navigate = useNavigate();
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const { data } = usePlazoAlertsSummary(companyId);

  const criticos = (data?.vencidos ?? 0) + (data?.urgentes ?? 0);
  const proximos = data?.proximos ?? 0;
  const total = criticos + proximos;

  const color = data?.vencidos ? '#ff4d4f' : criticos ? '#fa8c16' : '#1677ff';

  const tooltip = !data
    ? 'Alertas de plazos SUNAT'
    : total === 0
    ? 'Sin alertas de plazos'
    : [
        data.vencidos > 0 ? `${data.vencidos} vencido${data.vencidos !== 1 ? 's' : ''}` : null,
        data.urgentes > 0 ? `${data.urgentes} urgente${data.urgentes !== 1 ? 's' : ''}` : null,
        data.proximos > 0 ? `${data.proximos} proximo${data.proximos !== 1 ? 's' : ''}` : null,
      ]
        .filter(Boolean)
        .join(' / ');

  return (
    <Tooltip title={tooltip}>
      <Badge count={criticos || undefined} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          shape="circle"
          icon={
            criticos > 0 ? (
              <BellFilled style={{ fontSize: 18, color }} />
            ) : (
              <BellOutlined style={{ fontSize: 18, color }} />
            )
          }
          onClick={() => navigate(ROUTES.PLAZO_ALERTS)}
        />
      </Badge>
    </Tooltip>
  );
}
