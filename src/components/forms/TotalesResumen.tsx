import { Card, Descriptions } from 'antd';
import { useFormContext, useWatch } from 'react-hook-form';
import { calculateDocumentTotals } from '@/utils/tax-calculator';
import { formatMoney } from '@/utils/format';
import type { Moneda } from '@/types/common.types';

export default function TotalesResumen() {
  const { control } = useFormContext();
  const detalles = useWatch({ control, name: 'detalles' });
  const moneda = useWatch({ control, name: 'moneda' }) as Moneda || 'PEN';

  const totals = calculateDocumentTotals(detalles || []);

  return (
    <Card title="Totales" size="small" style={{ minWidth: 300 }}>
      <Descriptions column={1} size="small" colon={false}>
        {totals.mto_oper_gravadas > 0 && (
          <Descriptions.Item label="Op. Gravadas">{formatMoney(totals.mto_oper_gravadas, moneda)}</Descriptions.Item>
        )}
        {totals.mto_oper_exoneradas > 0 && (
          <Descriptions.Item label="Op. Exoneradas">{formatMoney(totals.mto_oper_exoneradas, moneda)}</Descriptions.Item>
        )}
        {totals.mto_oper_inafectas > 0 && (
          <Descriptions.Item label="Op. Inafectas">{formatMoney(totals.mto_oper_inafectas, moneda)}</Descriptions.Item>
        )}
        {totals.mto_oper_gratuitas > 0 && (
          <Descriptions.Item label="Op. Gratuitas">{formatMoney(totals.mto_oper_gratuitas, moneda)}</Descriptions.Item>
        )}
        <Descriptions.Item label="IGV (18%)">{formatMoney(totals.mto_igv, moneda)}</Descriptions.Item>
        {totals.mto_isc > 0 && (
          <Descriptions.Item label="ISC">{formatMoney(totals.mto_isc, moneda)}</Descriptions.Item>
        )}
        {totals.mto_icbper > 0 && (
          <Descriptions.Item label="ICBPER">{formatMoney(totals.mto_icbper, moneda)}</Descriptions.Item>
        )}
        <Descriptions.Item label={<strong>TOTAL</strong>}>
          <strong style={{ fontSize: 16, color: '#1677ff' }}>
            {formatMoney(totals.mto_imp_venta, moneda)}
          </strong>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
