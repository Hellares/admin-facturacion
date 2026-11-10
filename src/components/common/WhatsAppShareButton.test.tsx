// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import WhatsAppShareButton from './WhatsAppShareButton';

// jsdom no trae estas APIs que usan el Modal y el TextArea de antd
window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const base = {
  tipo: '03' as const,
  numero: 'B001-00000002',
  empresa: { ruc: '10484381742', razon_social: 'FARRO NUÑEZ KEVIN BRAYAN', nombre_comercial: 'KAVA' },
  cliente: { tipo_documento: '1', numero_documento: '40476231', razon_social: 'ANA PEREZ', telefono: '987654321' } as never,
  total: 46.5,
  moneda: 'PEN' as const,
};

describe('WhatsAppShareButton', () => {
  it('no aparece si el comprobante no está aceptado', () => {
    render(<WhatsAppShareButton {...base} status="PENDIENTE" />);
    expect(screen.queryByText('WhatsApp')).toBeNull();
  });

  it('abre wa.me con el celular del cliente y el link del PDF', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    render(<WhatsAppShareButton {...base} status="ACEPTADO" />);

    fireEvent.click(screen.getByText('WhatsApp'));
    expect((await screen.findByDisplayValue('987654321'))).toBeTruthy();
    fireEvent.click(screen.getByText('Abrir WhatsApp'));

    const url = open.mock.calls[0][0] as string;
    expect(url.startsWith('https://wa.me/51987654321?text=')).toBe(true);
    const texto = decodeURIComponent(url.split('text=')[1]);
    expect(texto).toContain('KAVA le envía su Boleta de Venta Electrónica B001-00000002');
    expect(texto).toContain('/consulta/10484381742/03/B001-00000002/pdf');
  });
});
