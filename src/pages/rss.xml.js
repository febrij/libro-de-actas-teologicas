import { getCollection } from 'astro:content';

export async function GET(context) {
  const actas = (await getCollection('actas', ({ data }) => !data.borrador))
    .sort((a, b) => b.data.fecha - a.data.fecha);
  const items = actas.map((a) => `
    <item>
      <title>${escapar(`Acta · ${a.data.titulo}`)}</title>
      <link>${context.site}actas/${a.id}/</link>
      <guid>${context.site}actas/${a.id}/</guid>
      <pubDate>${a.data.fecha.toUTCString()}</pubDate>
      <description>${escapar(a.data.resumen)}</description>
    </item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Libro de actas · cazador de ídolos</title>
  <link>${context.site}</link>
  <description>Actas teológicas verificables — una obra de cazador de ídolos</description>
  <language>es</language>${items}
</channel></rss>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
