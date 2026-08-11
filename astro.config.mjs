import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  // Cambia esto por tu dominio final cuando lo tengas:
  site: 'https://ejemplo.pages.dev',
  integrations: [mdx()],
});
