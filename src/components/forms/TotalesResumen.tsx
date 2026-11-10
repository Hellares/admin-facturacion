import { useFormContext, useWatch } from 'react-hook-form';
import { calculateDocumentTotals } from '@/utils/tax-calculator';
import { formatMoney } from '@/utils/format';
import type { Moneda } from '@/types/common.types';

const ACENTO = '#1f3a5f';

export default function TotalesResumen() {
  const { control } = useFormContext();
  const detalles = useWatch({ control, name: 'detalles' });
  const moneda = useWatch({ control, name: 'moneda' }) as Moneda || 'PEN';

  const totals = calculateDocumentTotals(detalles || []);

  const filas: [string, number, boolean][] = [
    ['Op. gravadas', totals.mto_oper_gravadas, totals.mto_oper_gravadas > 0],
    ['Op. exoneradas', totals.mto_oper_exoneradas, totals.mto_oper_exoneradas > 0],
    ['Op. inafectas', totals.mto_oper_inafectas, totals.mto_oper_inafectas > 0],
    ['Op. gratuitas', totals.mto_oper_gratuitas, totals.mto_oper_gratuitas > 0],
    ['IGV (18%)', totals.mto_igv, true],
    ['ISC', totals.mto_isc, totals.mto_isc > 0],
    ['ICBPER', totals.mto_icbper, totals.mto_icbper > 0],
  ];

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e7ee', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filas.filter(([, , ver]) => ver).map(([label, valor]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', color: '#4a525c' }}>
            <span>{label}</span>
            <span>{formatMoney(valor, moneda)}</span>
          </div>
        ))}
      </div>
      <div style={{ background: ACENTO, color: '#fff', padding: '14px 18px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>TOTAL A PAGAR</span>
        <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2 }}>{formatMoney(totals.mto_imp_venta, moneda)}</span>
      </div>
    </div>
  );
}
