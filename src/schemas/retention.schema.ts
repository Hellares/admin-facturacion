import { z } from 'zod';
import { clienteDocumentoSchema } from './common.schema';

// --- Sub-schemas ---

export const retentionPagoSchema = z.object({
  moneda: z.enum(['PEN', 'USD'], { error: 'Moneda requerida' }),
  fecha: z.string().min(1, 'Fecha requerida'),
  importe: z.number().min(0, 'Minimo 0'),
});

export const retentionTipoCambioSchema = z.object({
  fecha: z.string().min(1, 'Fecha requerida'),
  factor: z.number().min(0, 'Minimo 0'),
  moneda_obj: z.enum(['PEN', 'USD'], { error: 'Moneda objetivo requerida' }),
  moneda_ref: z.enum(['PEN', 'USD'], { error: 'Moneda referencia requerida' }),
});

export const retentionDetalleSchema = z.object({
  tipo_doc: z.enum(['01', '03', '12', '14'] as const, { error: 'Tipo de documento requerido' }),
  num_doc: z.string().min(1, 'Numero requerido').max(20),
  fecha_emision: z.string().min(1, 'Fecha emision requerida'),
  fecha_retencion: z.string().min(1, 'Fecha retencion requerida'),
  moneda: z.enum(['PEN', 'USD'], { error: 'Moneda requerida' }),
  imp_total: z.number().min(0, 'Minimo 0'),
  imp_pagar: z.number().min(0, 'Minimo 0'),
  imp_retenido: z.number().min(0, 'Minimo 0'),
  pagos: z.array(retentionPagoSchema).min(1, 'Agregue al menos un pago'),
  tipo_cambio: retentionTipoCambioSchema,
});

// --- Main schema ---

export const retentionSchema = z.object({
  company_id: z.number().min(1, 'Empresa requerida'),
  branch_id: z.number().min(1, 'Sucursal requerida'),
  serie: z.string().min(1, 'Serie requerida').max(4),
  correlativo: z.string().min(1, 'Correlativo requerido').max(8),
  fecha_emision: z.string().min(1, 'Fecha emision requerida'),
  moneda: z.enum(['PEN', 'USD'], { error: 'Moneda requerida' }),

  // Informacion de retencion
  regimen: z.enum(['01', '02', '03'] as const, { error: 'Seleccione regimen' }),
  tasa: z.number().min(0).max(100, 'Maximo 100%'),
  observacion: z.string().max(500).optional().or(z.literal('')),
  imp_retenido: z.number().min(0, 'Minimo 0'),
  imp_pagado: z.number().min(0, 'Minimo 0'),

  // Proveedor
  proveedor: clienteDocumentoSchema,

  // Detalles
  detalles: z.array(retentionDetalleSchema).min(1, 'Agregue al menos un documento'),
});

export type RetentionSchemaValues = z.infer<typeof retentionSchema>;
