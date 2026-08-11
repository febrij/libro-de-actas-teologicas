import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const actas = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/actas' }),
  schema: z.object({
    serie: z.enum(['olivo', 'cimientos', 'auditorias']).default('olivo'),
    titulo: z.string(),
    subtitulo: z.string().optional(),
    orden: z.number(),            // 1, 2, 3… define el numeral romano y el orden
    loci: z.string(),             // p. ej. "Bibliología"
    fecha: z.coerce.date(),
    estado: z.string().optional(),
    resumen: z.string(),
    pasajes: z.array(z.string()).default([]),  // alimenta el índice de pasajes
    borrador: z.boolean().default(false),      // true = no se publica
  }),
});

const documentos = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/documentos' }),
  schema: z.object({
    titulo: z.string(),
    subtitulo: z.string().optional(),
    orden: z.number(),
    fecha: z.coerce.date(),
    resumen: z.string(),
  }),
});

export const collections = { actas, documentos };
