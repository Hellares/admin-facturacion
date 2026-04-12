import { z } from 'zod';
import { clienteDocumentoSchema, detalleItemSchema, cuotaSchema, medioPagoSchema, detraccionSchema } from './common.schema';

export const boletaSchema = z.object({
  company_id: z.number().min(1, 'Seleccione empresa'),
  branch_id: z.number().min(1, 'Seleccione sucursal'),
  serie: z.string().min(1, 'Requerido').max(4),
  fecha_emision: z.string().min(1, 'Fecha requerida'),
  fecha_vencimiento: z.string().optional().or(z.literal('')),
  moneda: z.enum(['PEN', 'USD']),
  tipo_operacion: z.string().max(4).optional(),
  metodo_envio: z.enum(['individual', 'resumen_diario']),
  forma_pago_tipo: z.enum(['Contado', 'Credito']),
  forma_pago_cuotas: z.array(cuotaSchema).optional(),
  client: clienteDocumentoSchema,
  detalles: z.array(detalleItemSchema).min(1, 'Debe agregar al menos un item'),
  detraccion: detraccionSchema.optional(),
  medios_pago: z.array(medioPagoSchema).optional(),
  observaciones: z.string().max(1000).optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.forma_pago_tipo === 'Credito') {
    if (!data.forma_pago_cuotas || data.forma_pago_cuotas.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe agregar al menos una cuota para pago a credito',
        path: ['forma_pago_cuotas'],
      });
    }
  }
});

export type BoletaFormValues = z.infer<typeof boletaSchema>;
