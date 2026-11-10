// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import ItemsTable from './ItemsTable';

window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;

afterEach(cleanup);

const fila = (tip: string, pct: number) => ({
  codigo: '', descripcion: 'X', unidad: 'NIU', cantidad: 1, mto_precio_unitario: 10, tip_afe_igv: tip, porcentaje_igv: pct,
});

function Envoltorio({ detalles }: { detalles: ReturnType<typeof fila>[] }) {
  const methods = useForm({ defaultValues: { detalles } });
  return (
    <FormProvider {...methods}>
      <ItemsTable compacto />
    </FormProvider>
  );
}

const hayColumnaAfectacion = () => screen.queryAllByText('Afectación').length > 0;

describe('ItemsTable compacto: afectación e IGV ocultas', () => {
  it('con productos gravados al 18 % se ocultan y se muestran a pedido', () => {
    render(<Envoltorio detalles={[fila('10', 18)]} />);
    expect(hayColumnaAfectacion()).toBe(false);

    fireEvent.click(screen.getByText('Mostrar afectación e IGV'));
    expect(hayColumnaAfectacion()).toBe(true);
    expect(screen.queryAllByText('IGV %').length).toBeGreaterThan(0);
  });

  it('si un producto no es gravado al 18 % se muestran solas', () => {
    render(<Envoltorio detalles={[fila('10', 18), fila('20', 0)]} />);
    expect(hayColumnaAfectacion()).toBe(true);
  });
});
