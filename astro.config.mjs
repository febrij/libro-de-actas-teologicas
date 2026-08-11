import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  // Cuando tengas dominio propio, cámbialo aquí:
  site: 'https://libro-de-actas-teologicas.jimenezfabian9512.workers.dev',
  integrations: [mdx()],
});
