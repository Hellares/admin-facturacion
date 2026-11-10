import { describe, expect, it } from 'vitest';
import { calculateDocumentTotals, calculateItemTotals } from './tax-calculator';

// Caso real: B001-00000002 de FARRO NUÑEZ (09-11-2026), montos que guardó el backend.
const boleta = [
  { cantidad: 1, mto_precio_unitario: 12.6, tip_afe_igv: '10' },
  { cantidad: 1, mto_precio_unitario: 6.9, tip_afe_igv: '10' },
  { cantidad: 1, mto_precio_unitario: 8.9, tip_afe_igv: '10' },
  { cantidad: 2, mto_precio_unitario: 8.9, tip_afe_igv: '10' },
  { cantidad: 1, mto_precio_unitario: 0.3, tip_afe_igv: '10' },
] as const;

describe('tax-calculator igual que el backend', () => {
  it('2 x 8.90 con IGV incluido da 17.80, no 17.79', () => {
    const t = calculateItemTotals(boleta[3]);
    expect(t.mto_valor_venta).toBe(15.08);
    expect(t.igv).toBe(2.72);
    expect(t.total_item).toBe(17.8);
  });

  it('con el valor unitario guardado por el backend (detalle) también da 17.80', () => {
    const t = calculateItemTotals({ cantidad: 2, mto_valor_unitario: 7.5423728814, tip_afe_igv: '10' });
    expect(t.mto_precio_unitario).toBe(8.9);
    expect(t.total_item).toBe(17.8);
  });

  it('totales del documento coinciden con los de SUNAT', () => {
    const t = calculateDocumentTotals([...boleta]);
    expect(t.mto_oper_gravadas).toBe(39.41);
    expect(t.mto_igv).toBe(7.09);
    expect(t.mto_imp_venta).toBe(46.5);
  });
});
