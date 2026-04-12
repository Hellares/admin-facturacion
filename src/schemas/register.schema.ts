import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  email: z.string().min(1, 'El email es requerido').email('Ingrese un email valido'),
  password: z.string()
    .min(8, 'Minimo 8 caracteres')
    .regex(/[a-z]/, 'Debe contener al menos una minuscula')
    .regex(/[A-Z]/, 'Debe contener al menos una mayuscula')
    .regex(/[0-9]/, 'Debe contener al menos un numero'),
  password_confirmation: z.string().min(1, 'Confirme su contrasena'),
  ruc: z.string()
    .length(11, 'El RUC debe tener 11 digitos')
    .regex(/^(10|20)\d{9}$/, 'RUC invalido (debe iniciar con 10 o 20)'),
  razon_social: z.string().min(1, 'La razon social es requerida').max(255),
  direccion: z.string().min(1, 'La direccion es requerida').max(255),
  ubigeo: z.string(),
  departamento: z.string(),
  provincia: z.string(),
  distrito: z.string(),
}).refine(data => data.password === data.password_confirmation, {
  message: 'Las contrasenas no coinciden',
  path: ['password_confirmation'],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
