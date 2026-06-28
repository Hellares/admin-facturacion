import { describe, it, expect } from 'vitest';
import { parseSunatInfo, formatSunatInfo } from './sunat';

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
