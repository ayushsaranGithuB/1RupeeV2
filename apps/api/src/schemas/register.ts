import { z } from 'zod';

export const RegisterSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Enter a valid email address'),
    phone: z
        .string()
        .trim()
        .regex(/^\+91\d{10}$/, 'Enter a 10-digit phone number'),
});

export type Register = z.infer<typeof RegisterSchema>;
