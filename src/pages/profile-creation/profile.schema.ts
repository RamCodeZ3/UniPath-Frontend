import { z } from 'zod';

// Validation schema for profile creation
export const profileSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/, 'El nombre solo puede contener letras y números'),
  
  fechaNacimiento: z
    .string()
    .min(1, 'La fecha de nacimiento es requerida')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    }, 'Fecha inválida')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const age = Math.floor((new Date().getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return age >= 13;
    }, 'Debes tener al menos 13 años')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      return date <= new Date();
    }, 'La fecha no puede ser futura'),
  
  telefono: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(
      /^\+[1-9]\d{0,2}\s[\d\s-]+$/,
      'Ingresa el teléfono con código de país (ej: +1 809 000-0000)'
    )
    .refine((phone) => {
      // Remover espacios, guiones y el + para contar solo dígitos
      const digitsOnly = phone.replace(/[\s\-+]/g, '');
      return digitsOnly.length >= 8 && digitsOnly.length <= 15;
    }, 'El número debe tener entre 8 y 15 dígitos'),
  
  sexo: z
    .enum(['masculino', 'femenino', 'otro', 'prefiero_no_decir'], 'Por favor selecciona una opción'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
