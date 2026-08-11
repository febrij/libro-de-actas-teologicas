// Tarjetas sociales (Open Graph) generadas en el build: 1200×630 PNG por acta.
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { getCollection } from 'astro:content';
import { romano, SERIES } from '../../lib/util';

const literata = readFileSync('node_modules/@fontsource/literata/files/literata-latin-600-normal.woff');
const literataLight = readFileSync('node_modules/@fontsource/literata/files/literata-latin-400-normal.woff');
const archivo = readFileSync('node_modules/@fontsource/archivo/files/archivo-latin-600-normal.woff');

const PAPEL = '#fbfaf6', TINTA = '#211d18', RUBRICA = '#9c2b23', SUAVE = '#6b6459', LINEA = '#e5e0d4';

function tarjeta({ eyebrow, numeral, titulo, sub }) {
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px', height: '630px', display: 'flex', flexDirection: 'column',
        background: PAPEL, color: TINTA, padding: '64px 72px',
        fontFamily: 'Literata', borderBottom: `14px solid ${RUBRICA}`,
      },
      children: [
        { type: 'div', props: { style: { display: 'flex', fontFamily: 'Archivo', fontSize: '26px', letterSpacing: '5px', textTransform: 'uppercase', color: SUAVE }, children: eyebrow } },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flex: 1, alignItems: 'center', gap: '56px' },
            children: [
              numeral
                ? { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', color: RUBRICA }, children: [
                    { type: 'div', props: { style: { fontFamily: 'Archivo', fontSize: '24px', letterSpacing: '8px', color: TINTA }, children: 'ACTA' } },
                    { type: 'div', props: { style: { fontSize: '190px', fontWeight: 400, lineHeight: 1 }, children: numeral } },
                  ] } }
                : { type: 'div', props: { style: { display: 'flex', fontSize: '190px', color: RUBRICA, fontWeight: 400 }, children: '§' } },
              { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }, children: [
                  { type: 'div', props: { style: { fontSize: titulo.length > 34 ? '58px' : '72px', fontWeight: 600, lineHeight: 1.15 }, children: titulo } },
                  sub ? { type: 'div', props: { style: { fontFamily: 'LiterataLight', fontSize: '30px', color: SUAVE, lineHeight: 1.3 }, children: sub } } : null,
                ].filter(Boolean) } },
            ],
          },
        },
        { type: 'div', props: { style: { display: 'flex', justifyContent: 'space-between', borderTop: `2px solid ${LINEA}`, paddingTop: '22px', fontFamily: 'Archivo', fontSize: '24px', letterSpacing: '3px', color: SUAVE }, children: [
            { type: 'div', props: { children: 'LIBRO DE ACTAS' } },
            { type: 'div', props: { style: { color: RUBRICA }, children: 'CAZADOR DE ÍDOLOS' } },
          ] } },
      ],
    },
  };
}

async function png(vdom) {
  const svg = await satori(vdom, {
    width: 1200, height: 630,
    fonts: [
      { name: 'Literata', data: literata, weight: 600, style: 'normal' },
      { name: 'LiterataLight', data: literataLight, weight: 400, style: 'normal' },
      { name: 'Archivo', data: archivo, weight: 600, style: 'normal' },
    ],
  });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}

export async function getStaticPaths() {
  const actas = await getCollection('actas', ({ data }) => !data.borrador);
  const docs = await getCollection('documentos');
  return [
    { params: { slug: 'portada' }, props: { tipo: 'portada' } },
    ...actas.map((a) => ({ params: { slug: a.id }, props: { tipo: 'acta', a } })),
    ...docs.map((d) => ({ params: { slug: `obra-${d.id}` }, props: { tipo: 'doc', d } })),
  ];
}

export async function GET({ props }) {
  let v;
  if (props.tipo === 'acta') {
    const d = props.a.data;
    v = tarjeta({ eyebrow: SERIES[d.serie].nombre, numeral: romano(d.orden), titulo: d.titulo, sub: d.subtitulo || d.loci });
  } else if (props.tipo === 'doc') {
    const d = props.d.data;
    v = tarjeta({ eyebrow: 'La obra · documento', numeral: null, titulo: d.titulo, sub: d.subtitulo });
  } else {
    v = tarjeta({ eyebrow: 'Actas teológicas verificables', numeral: null, titulo: 'Libro de actas', sub: 'Una sola obra, tres series — cada afirmación rastreable hasta un pasaje abierto.' });
  }
  return new Response(await png(v), { headers: { 'Content-Type': 'image/png' } });
}
