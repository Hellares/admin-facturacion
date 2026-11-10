import { describe, it, expect } from 'vitest';
import { parseSunatInfo, formatSunatInfo, isRechazoReenviable, refrescarMientrasSeEnvia, refrescarListaMientrasSeEnvia } from './sunat';

describe('parseSunatInfo', () => {
  it('devuelve null para vacío/null/undefined', () => {
    expect(parseSunatInfo(null)).toBeNull();
    expect(parseSunatInfo(undefined)).toBeNull();
    expect(parseSunatInfo('')).toBeNull();
    expect(parseSunatInfo('   ')).toBeNull();
  });

  it('objeto { codigo, descripcion } pasa tal cual (facturas/boletas/guías: data.sunat)', () => {
    const info = { codigo: '2335', descripcion: 'Documento dado de baja', notas: ['x'] };
    expect(parseSunatInfo(info)).toEqual(info);
  });

  it('objeto sin código ni descripción → null', () => {
    expect(parseSunatInfo({ codigo: null, descripcion: null })).toBeNull();
    expect(parseSunatInfo({})).toBeNull();
  });

  it('string JSON crudo con code/message (resúmenes/anulaciones) se parsea', () => {
    const out = parseSunatInfo('{"code":"2335","message":"El comprobante ya fue dado de baja"}');
    expect(out).toEqual({ codigo: '2335', descripcion: 'El comprobante ya fue dado de baja', notas: null });
  });

  it('string JSON crudo con codigo/descripcion/notas se parsea', () => {
    const out = parseSunatInfo('{"codigo":"0103","descripcion":"Aceptado","notas":["nota 1"]}');
    expect(out).toEqual({ codigo: '0103', descripcion: 'Aceptado', notas: ['nota 1'] });
  });

  it('JSON malformado cae a descripción = texto plano (no rompe)', () => {
    expect(parseSunatInfo('{ esto no es json')).toEqual({ descripcion: '{ esto no es json' });
  });

  it('string plano (leyenda legacy) → descripción', () => {
    expect(parseSunatInfo('Aceptado por SUNAT')).toEqual({ descripcion: 'Aceptado por SUNAT' });
  });

  it('mapea description→descripcion y error→descripcion en JSON', () => {
    expect(parseSunatInfo('{"code":"100","description":"desc"}')?.descripcion).toBe('desc');
    expect(parseSunatInfo('{"code":"100","error":"err"}')?.descripcion).toBe('err');
  });
});

describe('formatSunatInfo', () => {
  it('con código → "SUNAT {cod}: {msg}"', () => {
    expect(formatSunatInfo({ codigo: '2335', descripcion: 'baja' })).toBe('SUNAT 2335: baja');
  });

  it('parsea string JSON crudo a una línea', () => {
    expect(formatSunatInfo('{"code":"2335","message":"baja"}')).toBe('SUNAT 2335: baja');
  });

  it('sin código → solo la descripción', () => {
    expect(formatSunatInfo({ descripcion: 'Aceptado' })).toBe('Aceptado');
  });

  it('sin info útil → null', () => {
    expect(formatSunatInfo(null)).toBeNull();
    expect(formatSunatInfo('')).toBeNull();
    expect(formatSunatInfo({ codigo: '5' })).toBeNull(); // sin descripción
  });
});

describe('isRechazoReenviable', () => {
  it('rechazo por validación SUNAT (2000-3999) NO se reenvía', () => {
    expect(isRechazoReenviable('2324')).toBe(false);
    expect(isRechazoReenviable(3105)).toBe(false);
    expect(isRechazoReenviable('2000')).toBe(false);
    expect(isRechazoReenviable('3999')).toBe(false);
  });

  it('corte de conexión, excepción o error interno SÍ se reenvía', () => {
    expect(isRechazoReenviable('HTTP')).toBe(true);
    expect(isRechazoReenviable('EXCEPTION')).toBe(true);
    expect(isRechazoReenviable('0110')).toBe(true);
    expect(isRechazoReenviable('00104')).toBe(true);
    expect(isRechazoReenviable('1033')).toBe(true);
  });

  it('sin código no se ofrece', () => {
    expect(isRechazoReenviable(null)).toBe(false);
    expect(isRechazoReenviable(undefined)).toBe(false);
    expect(isRechazoReenviable('')).toBe(false);
  });
});

describe('refrescar mientras se envía a SUNAT', () => {
  const q = <T,>(data: T, dataUpdateCount = 1) => ({ state: { data, dataUpdateCount } });

  it('detalle: consulta cada 3 s mientras está en cola o enviando', () => {
    expect(refrescarMientrasSeEnvia(q({ estado_sunat: 'EN_COLA' }))).toBe(3000);
    expect(refrescarMientrasSeEnvia(q({ estado_sunat: 'ENVIANDO' }))).toBe(3000);
  });

  it('detalle: se detiene con un estado final, en PENDIENTE o tras ~2 minutos', () => {
    expect(refrescarMientrasSeEnvia(q({ estado_sunat: 'ACEPTADO' }))).toBe(false);
    expect(refrescarMientrasSeEnvia(q({ estado_sunat: 'RECHAZADO' }))).toBe(false);
    expect(refrescarMientrasSeEnvia(q({ estado_sunat: 'PENDIENTE' }))).toBe(false);
    expect(refrescarMientrasSeEnvia(q({ estado_sunat: 'EN_COLA' }, 40))).toBe(false);
  });

  it('lista: consulta mientras alguna fila está en envío', () => {
    expect(refrescarListaMientrasSeEnvia(q({ data: [{ estado_sunat: 'ACEPTADO' }, { estado_sunat: 'EN_COLA' }] }))).toBe(3000);
    expect(refrescarListaMientrasSeEnvia(q({ data: [{ estado_sunat: 'ACEPTADO' }] }))).toBe(false);
  });
});
