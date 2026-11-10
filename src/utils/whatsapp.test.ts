import { describe, expect, it } from 'vitest';
import { linkPdfPublico, mensajeComprobante, normalizarCelular, urlWhatsApp } from './whatsapp';

describe('normalizarCelular', () => {
  it('celular peruano de 9 dígitos: antepone 51', () => {
    expect(normalizarCelular('987 654 321')).toBe('51987654321');
  });
  it('ya trae el código de país', () => {
    expect(normalizarCelular('+51 987-654-321')).toBe('51987654321');
  });
  it('fijo, vacío o incompleto: no sirve', () => {
    expect(normalizarCelular('044 123456')).toBeNull();
    expect(normalizarCelular('')).toBeNull();
    expect(normalizarCelular(null)).toBeNull();
    expect(normalizarCelular('98765')).toBeNull();
  });
});

describe('mensaje y link', () => {
  it('arma el link público del PDF', () => {
    expect(linkPdfPublico('https://app.syncrofact.net.pe', '10484381742', '03', 'B001-00000002'))
      .toBe('https://app.syncrofact.net.pe/consulta/10484381742/03/B001-00000002/pdf');
  });

  it('el mensaje lleva comprobante, total y link, y viaja codificado', () => {
    const msg = mensajeComprobante({
      cliente: 'ANA', empresa: 'KAVA', tipo: '03', numero: 'B001-00000002', total: 'S/ 46.50', link: 'https://x/pdf',
    });
    expect(msg).toContain('Boleta de Venta Electrónica B001-00000002 por S/ 46.50');
    expect(msg).toContain('https://x/pdf');
    const url = urlWhatsApp('51987654321', msg);
    expect(url.startsWith('https://wa.me/51987654321?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toBe(msg);
  });
});
