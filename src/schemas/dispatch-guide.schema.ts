import { z } from 'zod';
import { clienteDocumentoSchema } from './common.schema';

const direccionEnvioSchema = z.object({
  ubigeo: z.string().min(1, 'Ubigeo requerido').length(6, 'Ubigeo debe tener 6 digitos'),
  direccion: z.string().min(1, 'Direccion requerida').max(255),
  ruc: z.string().optional().or(z.literal('')),
  cod_local: z.string().optional().or(z.literal('')),
});

// Los campos internos aceptan vacío porque la validación condicional
// (requerido según modalidad) se hace en superRefine
const transportistaSchema = z.object({
  tipo_documento: z.string().optional().or(z.literal('')),
  numero_documento: z.string().optional().or(z.literal('')),
  razon_social: z.string().optional().or(z.literal('')),
  nro_mtc: z.string().optional().or(z.literal('')),
});

const conductorSchema = z.object({
  tipo_documento: z.string().optional().or(z.literal('')),
  numero_documento: z.string().optional().or(z.literal('')),
  nombres: z.string().optional().or(z.literal('')),
  apellidos: z.string().optional().or(z.literal('')),
  licencia: z.string().optional().or(z.literal('')),
});

const detalleGuiaSchema = z.object({
  codigo: z.string().min(1, 'Requerido').max(50),
  descripcion: z.string().min(1, 'Requerido').max(500),
  unidad: z.string().min(1, 'Requerido').max(3),
  cantidad: z.number().min(0.001, 'Minimo 0.001'),
  peso_total: z.number().min(0).optional(),
});

export const dispatchGuideSchema = z.object({
  company_id: z.number().min(1),
  branch_id: z.number().min(1),
  serie: z.string().min(1, 'Requerido').max(4),
  fecha_emision: z.string().min(1, 'Fecha requerida'),
  fecha_traslado: z.string().min(1, 'Fecha traslado requerida'),
  cod_traslado: z.string().min(1, 'Seleccione motivo de traslado'),
  mod_traslado: z.enum(['01', '02'], { error: 'Seleccione modalidad' }),
  peso_total: z.number().min(0.001, 'Peso requerido'),
  und_peso_total: z.string().min(1),
  num_bultos: z.number().min(0).optional(),
  destinatario: clienteDocumentoSchema,
  partida: direccionEnvioSchema,
  llegada: direccionEnvioSchema,
  transportista: transportistaSchema.optional(),
  conductor: conductorSchema.optional(),
  vehiculo_placa: z.string().optional().or(z.literal('')),
  indicadores: z.array(z.string()).optional(),
  detalles: z.array(detalleGuiaSchema).min(1, 'Debe agregar al menos un item'),
  observaciones: z.string().max(1000).optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.mod_traslado === '01' && !data.transportista?.numero_documento) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Transportista requerido para transporte publico', path: ['transportista', 'numero_documento'] });
  }
  // Casos especiales en modalidad 02 que NO requieren conductor ni vehiculo:
  //  - Vehiculo M1L (indicador SUNAT_Envio_IndicadorTrasladoVehiculoM1L)
  //  - Motivo de traslado 04 (importacion)
  const isM1L = (data.indicadores || []).includes('SUNAT_Envio_IndicadorTrasladoVehiculoM1L');
  const skipConductorVehiculo = isM1L || data.cod_traslado === '04';

  if (data.mod_traslado === '02' && !skipConductorVehiculo && !data.conductor?.numero_documento && !data.vehiculo_placa) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Conductor o vehiculo requerido para transporte privado', path: ['conductor', 'numero_documento'] });
  }
});

export type DispatchGuideFormValues = z.infer<typeof dispatchGuideSchema>;
