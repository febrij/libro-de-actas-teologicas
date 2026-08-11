import { getCollection } from 'astro:content';

export async function GET(context) {
  const actas = await getCollection('actas', ({ data }) => !data.borrador);
  const docs = await getCollection('documentos');
  const urls = ['', 'indice-pasajes/', 'buscar/', 'bereano/',
    ...actas.map((a) => `actas/${a.id}/`),
    ...docs.map((d) => `obra/${d.id}/`)];
  const cuerpo = urls.map((u) => `<url><loc>${context.site}${u}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${cuerpo}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
