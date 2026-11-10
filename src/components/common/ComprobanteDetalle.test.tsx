// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ComprobanteDetalle from './ComprobanteDetalle';
import type { SunatStatus } from '@/types/common.types';

window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

afterEach(cleanup);

function montar(estado: SunatStatus, respuesta?: string) {
  return render(
    <MemoryRouter>
      <ComprobanteDetalle
        tipoNombre="Boleta de venta electrónica"
        numero="B001-00000002"
        volver={{ label: 'Boletas', path: '/boletas' }}
        fechaEmision="2026-11-09"
        creadoEn="2026-11-10T00:31:16Z"
        actualizadoEn="2026-11-10T00:31:19Z"
        moneda="PEN"
        formaPago="Contado"
        cliente={{ tipo_documento: '1', numero_documento: '40476231', razon_social: 'ANA PEREZ' }}
        detalles={[{ codigo: '43343', descripcion: 'SHAMPOO', unidad: 'NIU', cantidad: 2, mto_precio_unitario: 8.9, tip_afe_igv: '10', porcentaje_igv: 18 } as never]}
        totales={{ gravada: 15.08, igv: 2.72, total: 17.8 }}
        estado={estado}
        respuestaSunat={respuesta}
        hash="YrQ4+PJv5Of5aVAT83ETCFQHrAk="
        acciones={<button type="button">Ver PDF</button>}
        datos={[{ label: 'Origen', value: 'Portal web' }]}
      />
    </MemoryRouter>,
  );
}

describe('ComprobanteDetalle', () => {
  it('aceptada: muestra el estado, la respuesta, el total y los datos', () => {
    montar('ACEPTADO', 'La Boleta numero B001-2, ha sido aceptado');
    expect(screen.getByText('Aceptada por SUNAT')).toBeTruthy();
    expect(screen.getByText('La Boleta numero B001-2, ha sido aceptado')).toBeTruthy();
    expect(screen.getByText('Respuesta de SUNAT')).toBeTruthy();
    expect(screen.getAllByText('S/ 17.80').length).toBeGreaterThan(0);
    expect(screen.getByText('ANA PEREZ')).toBeTruthy();
    expect(screen.getByText('YrQ4+PJv5Of5aVAT83ETCFQHrAk=')).toBeTruthy();
  });

  it('en cola: indica que está enviando y espera la respuesta', () => {
    montar('EN_COLA');
    expect(screen.getByText('Enviando a SUNAT…')).toBeTruthy();
    expect(screen.getByText('Esperando respuesta de SUNAT')).toBeTruthy();
  });

  it('rechazada: muestra el estado de rechazo', () => {
    montar('RECHAZADO', 'El RUC del receptor no existe');
    expect(screen.getByText('El RUC del receptor no existe')).toBeTruthy();
    expect(screen.queryByText('Aceptada por SUNAT')).toBeNull();
  });
});
