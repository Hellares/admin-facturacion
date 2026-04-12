import { z } from 'zod';

/**
 * Valida el numero de documento segun el tipo SUNAT (catalogo 06):
 *   0 = Sin documento / Consumidor final (libre, suele ser "00000000")
 *   1 = DNI (8 digitos numericos exactos)
 *   4 = Carnet de Extranjeria (9-12 caracteres alfanumericos)
 *   6 = RUC (11 digitos numericos, inicia con 10/15/17/20)
 *   7 = Pasaporte (1-15 caracteres alfanumericos)
 *
 * Esta validacion se hace en el frontend para dar feedback inmediato al usuario
 * y prevenir rechazos de SUNAT por datos mal formateados (ej. codigo 2660).
 */
function validateNumeroDocumento(tipo: string, numero: string): { ok: boolean; message?: string } {
  const value = (numero || '').trim();

  switch (tipo) {
    case '1': // DNI
      if (!/^\d{8}$/.test(value)) {
        return { ok: false, message: 'El DNI debe tener exactamente 8 digitos numericos' };
      }
      return { ok: true };

    case '6': // RUC
      if (!/^\d{11}$/.test(value)) {
        return { ok: false, message: 'El RUC debe tener exactamente 11 digitos numericos' };
      }
      if (!/^(10|15|17|20)/.test(value)) {
        return { ok: false, message: 'El RUC debe iniciar con 10, 15, 17 o 20' };
      }
      return { ok: true };

    case '4': // Carnet de Extranjeria
      if (value.length < 9 || value.length > 12) {
        return { ok: false, message: 'El Carnet de Extranjeria debe tener entre 9 y 12 caracteres' };
      }
      return { ok: true };

    case '7': // Pasaporte
      if (value.length < 1 || value.length > 15) {
        return { ok: false, message: 'El Pasaporte debe tener entre 1 y 15 caracteres' };
      }
      return { ok: true };

    case '0': // Sin documento / Consumidor final
      // Aceptamos cualquier cadena no vacia (tipicamente "00000000")
      if (value.length === 0) {
        return { ok: false, message: 'Requerido' };
      }
      return { ok: true };

    default:
      return { ok: false, message: 'Tipo de documento no reconocido' };
  }
}

export const clienteDocumentoSchema = z
  .object({
    tipo_documento: z.enum(['0', '1', '4', '6', '7'] as const, { error: 'Seleccione tipo' }),
    numero_documento: z.string().min(1, 'Requerido').max(15),
    razon_social: z.string().min(1, 'Requerido').max(255),
    nombre_comercial: z.string().max(255).optional().or(z.literal('')),
    direccion: z.string().max(255).optional().or(z.literal('')),
    ubigeo: z.string().optional().or(z.literal('')),
    telefono: z.string().max(20).optional().or(z.literal('')),
    email: z.string().email('Email invalido').optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    const result = validateNumeroDocumento(data.tipo_documento, data.numero_documento);
    if (!result.ok) {
      ctx.addIssue({
        code: 'custom',
        path: ['numero_documento'],
        message: result.message || 'Numero de documento invalido',
      });
    }
  });

export const detalleItemSchema = z.object({
  codigo: z.string().min(1, 'Requerido').max(50),
  descripcion: z.string().min(1, 'Requerido').max(500),
  unidad: z.string().min(1, 'Requerido').max(3),
  cantidad: z.number().min(0.001, 'Minimo 0.001'),
  mto_valor_unitario: z.number().min(0).optional(),
  mto_precio_unitario: z.number().min(0).optional(),
  tip_afe_igv: z.enum([
    '10', '11', '12', '13', '14', '15', '16', '17',
    '20', '21',
    '30', '31', '32', '33', '34', '35', '36', '37',
    '40',
  ] as const),
  porcentaje_igv: z.number().min(0).max(100),
  tip_sis_isc: z.enum(['01', '02', '03']).optional(),
  porcentaje_isc: z.number().min(0).max(1000).optional(),
  factor_icbper: z.number().min(0).optional(),
}).refine(
  (data) => (data.mto_valor_unitario && data.mto_valor_unitario > 0) || (data.mto_precio_unitario && data.mto_precio_unitario > 0),
  { message: 'Debe ingresar precio unitario o valor unitario', path: ['mto_precio_unitario'] }
);

export const cuotaSchema = z.object({
  moneda: z.enum(['PEN', 'USD']),
  monto: z.number().min(0.01, 'Monto minimo 0.01'),
  fecha_pago: z.string().min(1, 'Fecha requerida'),
});

export const medioPagoSchema = z.object({
  tipo: z.string().min(1, 'Requerido').max(10),
  monto: z.number().min(0.01, 'Monto minimo 0.01'),
  referencia: z.string().max(100).optional().or(z.literal('')),
});

export const detraccionSchema = z.object({
  codigo_bien_servicio: z.string().min(1, 'Requerido').max(3),
  codigo_medio_pago: z.string().max(3).optional(),
  cuenta_banco: z.string().min(1, 'Cuenta requerida').max(20),
  porcentaje: z.number().min(0).max(100).optional(),
  monto: z.number().min(0).optional(),
});

export const percepcionSchema = z.object({
  cod_regimen: z.string().min(1, 'Requerido').max(2),
  tasa: z.number().min(0).max(100),
  monto: z.number().min(0),
  monto_base: z.number().min(0),
});

export type ClienteDocumentoFormValues = z.infer<typeof clienteDocumentoSchema>;
export type DetalleItemFormValues = z.infer<typeof detalleItemSchema>;
export type CuotaFormValues = z.infer<typeof cuotaSchema>;
export type MedioPagoFormValues = z.infer<typeof medioPagoSchema>;
