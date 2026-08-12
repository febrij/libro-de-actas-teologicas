import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypePasajes from './src/lib/rehype-pasajes.mjs';
import rehypeTitulos from './src/lib/rehype-titulos.mjs';
import rehypeOriginal from './src/lib/rehype-original.mjs';

export default defineConfig({
  // Cuando tengas dominio propio, cámbialo aquí:
  site: 'https://libro-de-actas-teologicas.jimenezfabian9512.workers.dev',
  integrations: [mdx()],
  markdown: { rehypePlugins: [rehypeTitulos, rehypePasajes, rehypeOriginal] },
});
