import { z } from 'zod'

export const generationTypeSchema = z.enum([
  'summary',
  'rewrite_professional',
  'rewrite_casual',
  'bullets',
])

export const generateSchema = z.object({
  input: z
    .string()
    .min(10, { message: 'Content must be at least 10 characters' })
    .max(5000, { message: 'Content cannot exceed 5000 characters' })
    .trim(),
  type: generationTypeSchema,
})

export const shareUpdateSchema = z.object({
  isShared: z.boolean(),
  isPublic: z.boolean(),
  expiresIn: z.enum(['1h', '24h', '7d']).nullable().optional().default(null),
})

export type GenerateInput = z.infer<typeof generateSchema>
export type ShareUpdateInput = z.infer<typeof shareUpdateSchema>
