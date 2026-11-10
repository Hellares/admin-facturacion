// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Form } from 'antd';
import ClientSelector from './ClientSelector';
import { lookupService } from '@/services/lookup.service';

vi.mock('@/services/lookup.service', () => ({
  lookupService: {
    dni: vi.fn().mockResolvedValue({ numero: '40476231', nombre_completo: 'ANA PEREZ', direccion: 'AV. LIMA 1' }),
    ruc: vi.fn().mockResolvedValue({ numero: '20132373958', nombre_o_razon_social: 'EMPRESA SAC', direccion: 'AV. ESPAÑA 1' }),
  },
}));
vi.mock('@/services/client.service', () => ({ clientService: { searchByDocument: vi.fn() } }));

// jsdom no trae estas APIs que usa antd
window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function Envoltorio({ tipo, tipoDoc }: { tipo: 'boleta' | 'factura'; tipoDoc: string }) {
  const methods = useForm({ defaultValues: { client: { tipo_documento: tipoDoc, numero_documento: '', razon_social: '' } } });
  const razon = useWatch({ control: methods.control, name: 'client.razon_social' });
  return (
    <FormProvider {...methods}>
      <Form layout="vertical" component="div">
        <ClientSelector prefix="client" documentType={tipo} />
      </Form>
      <output data-testid="razon">{razon}</output>
    </FormProvider>
  );
}

const numero = () => screen.getByPlaceholderText(/dígitos|Número/) as HTMLInputElement;

describe('ClientSelector: búsqueda automática', () => {
  it('boleta: al completar 8 dígitos busca el DNI una sola vez y llena el nombre', async () => {
    render(<Envoltorio tipo="boleta" tipoDoc="1" />);
    fireEvent.change(numero(), { target: { value: '4047623' } });
    expect(lookupService.dni).not.toHaveBeenCalled();

    fireEvent.change(numero(), { target: { value: '40476231' } });
    await waitFor(() => expect(screen.getByTestId('razon').textContent).toBe('ANA PEREZ'));
    fireEvent.change(numero(), { target: { value: '40476231' } });
    expect(lookupService.dni).toHaveBeenCalledTimes(1);
  });

  it('factura: con 11 dígitos busca el RUC', async () => {
    render(<Envoltorio tipo="factura" tipoDoc="6" />);
    fireEvent.change(numero(), { target: { value: '20132373958' } });
    await waitFor(() => expect(lookupService.ruc).toHaveBeenCalledWith('20132373958'));
  });

  it('factura: un DNI no se busca y avisa que exige RUC', () => {
    render(<Envoltorio tipo="factura" tipoDoc="6" />);
    fireEvent.change(numero(), { target: { value: '40476231' } });
    expect(screen.getByText(/La factura requiere RUC/)).toBeTruthy();
    expect(lookupService.dni).not.toHaveBeenCalled();
    expect(lookupService.ruc).not.toHaveBeenCalled();
  });

  it('boleta: si escriben un RUC sugiere emitir factura', () => {
    render(<Envoltorio tipo="boleta" tipoDoc="1" />);
    fireEvent.change(numero(), { target: { value: '20132373958' } });
    expect(screen.getByText(/emita factura/)).toBeTruthy();
  });
});
