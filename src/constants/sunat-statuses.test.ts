import { describe, it, expect } from 'vitest';
import {
  SUNAT_STATUS_VALUES,
  SUNAT_STATUS_LABELS,
  SUNAT_STATUS_COLORS,
} from './sunat-statuses';

/**
 * Guarda de regresión del bug original: el type/los mapas no cubrían
 * EN_COLA, ANULADO ni NO_EMITIDO (que el backend Laravel emite), por lo que
 * el badge mostraba el string crudo gris. Estos tests fallan si vuelve a faltar
 * un estado en label o color.
 */
describe('estados SUNAT — completitud', () => {
  it('todo estado válido tiene label no vacío', () => {
    for (const s of SUNAT_STATUS_VALUES) {
      expect(SUNAT_STATUS_LABELS[s], `falta label para ${s}`).toBeTruthy();
    }
  });

  it('todo estado válido tiene color', () => {
    for (const s of SUNAT_STATUS_VALUES) {
      expect(SUNAT_STATUS_COLORS[s], `falta color para ${s}`).toBeTruthy();
    }
  });

  it('incluye los estados que emite Laravel (incl. EN_COLA, ANULADO, NO_EMITIDO)', () => {
    const laravel = [
      'PENDIENTE', 'EN_COLA', 'ENVIADO', 'PROCESANDO',
      'ACEPTADO', 'RECHAZADO', 'ANULADO', 'NO_EMITIDO', 'ERROR',
    ];
    for (const s of laravel) {
      expect(SUNAT_STATUS_VALUES, `falta estado ${s}`).toContain(s);
    }
  });
});

describe('estados SUNAT — vocabulario alineado al filtro', () => {
  it('ACEPTADO se muestra como "Validado"', () => {
    expect(SUNAT_STATUS_LABELS.ACEPTADO).toBe('Validado');
  });

  it('ANULADO se muestra como "Dado de baja"', () => {
    expect(SUNAT_STATUS_LABELS.ANULADO).toBe('Dado de baja');
  });

  it('EN_COLA y NO_EMITIDO tienen etiqueta legible', () => {
    expect(SUNAT_STATUS_LABELS.EN_COLA).toBe('En cola');
    expect(SUNAT_STATUS_LABELS.NO_EMITIDO).toBe('No emitido');
  });
});
