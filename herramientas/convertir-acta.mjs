#!/usr/bin/env node
// Convierte un borrador .md (formato Substack de la serie) en una acta del sitio.
//
// Uso:
//   node herramientas/convertir-acta.mjs borrador.md --serie olivo --orden 5 --loci "Eclesiología"
//
// Hace exactamente lo que hizo la conversión de las actas existentes:
//   1. Quita el título/subtítulo de cabecera (van al frontmatter).
//   2. Convierte [Confianza …] en sellos <Conf> (párrafos, encabezados e inline),
//      dejando intactos los corchetes dentro de tablas y los [DATO]/[verificado].
//   3. Garantiza línea en blanco tras cada sello.
//   4. Escribe src/content/actas/<slug>.mdx con borrador: true para que lo revises
//      en local (npm run dev) antes de publicarlo (borrador: false).
//
// Después de convertir: completa `resumen:` y `pasajes:` en el frontmatter.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const archivo = args[0];
if (!archivo || !existsSync(archivo)) {
  console.error('Uso: node herramientas/convertir-acta.mjs <borrador.md> --serie olivo|cimientos --orden N --loci "Locus"');
  process.exit(1);
}
const opcion = (n, defecto = '') => {
  const i = args.indexOf('--' + n);
  return i > -1 ? args[i + 1] : defecto;
};
const serie = opcion('serie', 'cimientos');
const orden = opcion('orden', '0');
const loci = opcion('loci', 'COMPLETAR');

const src = readFileSync(archivo, 'utf8');

// Título y subtítulo desde la cabecera
const titulo = (src.match(/^#\s+(.+)$/m) || [, 'COMPLETAR'])[1].trim();
const subtitulo = (src.match(/^#{2,3}\s+(?:Acta\s+[IVXLC]+\s*·\s*)?(.+)$/m) || [, ''])[1].trim();

// Cuerpo: desde el primer separador ---
let body = src.includes('\n---\n') ? src.split('\n---\n').slice(1).join('\n---\n').trim() : src.trim();

// Sellos de confianza
body = body.replace(/^\*\*\[([^\]]*[Cc]onfianza[^\]]*)\]\*\*$/gm, '<Conf>$1</Conf>');
body = body.replace(/^(#{2,4} .*?)\s*[—–-]?\s*\[([^\]]*[Cc]onfianza[^\]]*)\]\s*$/gm,
  (_, h, c) => `${h.replace(/\s*[—–-]\s*$/, '')}\n\n<Conf>${c}</Conf>`);
body = body.split('\n').map((l) =>
  l.trimStart().startsWith('|') ? l : l.replace(/\[([Cc]onfianza[^\]]{0,120})\]/g, '<Conf>$1</Conf>')
).join('\n');
body = body.replace(/^(<Conf>[^\n]*<\/Conf>)\n(?!\n)/gm, '$1\n\n');

// Sanidad MDX
if (/[{}]/.test(body)) { console.error('ERROR: el texto contiene llaves { } — revísalas antes de convertir.'); process.exit(1); }
const raras = body.split('\n').filter((l) => l.includes('<') && !l.includes('<Conf>') && !/^\s*<\/?Conf>/.test(l));
if (raras.length) { console.error('ERROR: hay < fuera de los sellos:\n' + raras.slice(0, 3).join('\n')); process.exit(1); }

const slug = titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[«»""]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const fecha = new Date().toISOString().slice(0, 10);
const fm = `---
serie: ${serie}
titulo: "${titulo.replace(/"/g, '\\"')}"
${subtitulo ? `subtitulo: "${subtitulo.replace(/"/g, '\\"')}"\n` : ''}orden: ${orden}
loci: "${loci}"
fecha: ${fecha}
estado: "Vigente"
borrador: true
resumen: "COMPLETAR: una o dos líneas para la portada (la posición en una frase suele servir)."
pasajes: []   # COMPLETAR: p. ej. ["Romanos 11:26", "Daniel 9:24–27"] — alimenta el índice bíblico
---

`;

const destino = `src/content/actas/${slug}.mdx`;
if (existsSync(destino)) { console.error(`ERROR: ya existe ${destino} — bórralo o renombra el título.`); process.exit(1); }
writeFileSync(destino, fm + body + '\n');
console.log(`Acta convertida -> ${destino}`);
console.log(`Sellos <Conf>: ${(body.match(/<Conf>/g) || []).length} | Palabras: ${body.split(/\s+/).length}`);
console.log('Siguiente: completa resumen y pasajes, revisa con `npm run dev`, y cambia borrador: false para publicar.');
