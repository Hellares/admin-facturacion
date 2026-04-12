import { z } from 'zod';
import { clienteDocumentoSchema, detalleItemSchema, cuotaSchema, medioPagoSchema } from './common.schema';

export const creditNoteSchema = z.object({
  company_id: z.number().min(1, 'Seleccione empresa'),
  branch_id: z.number().min(1, 'Seleccione sucursal'),
  serie: z.string().min(1, 'Requerido').max(4),
  fecha_emision: z.string().min(1, 'Fecha requerida'),
  moneda: z.enum(['PEN', 'USD']),
  tipo_doc_afectado: z.enum(['01', '03'], { error: 'Seleccione tipo' }),
  num_doc_afectado: z.string().min(1, 'Seleccione documento afectado'),
  cod_motivo: z.string().min(1, 'Seleccione motivo'),
  des_motivo: z.string().max(250).optional().or(z.literal('')),
  forma_pago_tipo: z.enum(['Contado', 'Credito']),
  forma_pago_cuotas: z.array(cuotaSchema).optional(),
  client: clienteDocumentoSchema,
  detalles: z.array(detalleItemSchema).min(1, 'Debe agregar al menos un item'),
  medios_pago: z.array(medioPagoSchema).optional(),
  observaciones: z.string().max(1000).optional().or(z.literal('')),
});

export type CreditNoteFormValues = z.infer<typeof creditNoteSchema>;
