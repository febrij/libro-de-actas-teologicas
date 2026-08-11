// Detección de citas bíblicas en tiempo de compilación.
// Envuelve "Ro 11:26", "Dn 9:24-27", "Is 52:13–53:12", etc. en <span class="pas">
// con los datos que el popover necesita. El texto del autor no se toca.
import mapa from './biblia-mapa.json' with { type: 'json' };

const porToken = new Map();
const tokens = [];
for (const libro of mapa) {
  for (const t of libro.tokens) {
    porToken.set(t, libro);
    tokens.push(t);
  }
}
tokens.sort((a, b) => b.length - a.length);
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE = new RegExp(
  `(?<![A-Za-zÁ-ÿ0-9])(${tokens.map(esc).join('|')})\\.?[\\s\\u00A0](\\d{1,3}):(\\d{1,3})(?:\\s?[-–]\\s?(?:(\\d{1,3}):)?(\\d{1,3}))?`,
  'g'
);

const OMITIR = new Set(['a', 'code', 'pre', 'script', 'style']);

function procesarTexto(valor) {
  const partes = [];
  let ultimo = 0;
  for (const m of valor.matchAll(RE)) {
    const [todo, token, c1, v1, c2, v2] = m;
    const libro = porToken.get(token);
    // Validación mínima: el capítulo debe ser plausible (evita "Job 3:1" falso en otra palabra ya cubierto por el límite)
    if (m.index > ultimo) partes.push({ type: 'text', value: valor.slice(ultimo, m.index) });
    partes.push({
      type: 'element',
      tagName: 'span',
      properties: {
        className: ['pas'],
        dataLibro: libro.slug,
        dataNombre: libro.nombre,
        dataC1: c1, dataV1: v1,
        ...(c2 ? { dataC2: c2 } : {}),
        ...(v2 ? { dataV2: v2 } : {}),
      },
      children: [{ type: 'text', value: todo }],
    });
    ultimo = m.index + todo.length;
  }
  if (!partes.length) return null;
  if (ultimo < valor.length) partes.push({ type: 'text', value: valor.slice(ultimo) });
  return partes;
}

function caminar(nodo) {
  if (!nodo.children) return;
  if (nodo.type === 'element') {
    if (OMITIR.has(nodo.tagName)) return;
    const cls = nodo.properties?.className;
    if (Array.isArray(cls) && (cls.includes('gloss') || cls.includes('pas'))) return;
  }
  const nuevos = [];
  for (const hijo of nodo.children) {
    if (hijo.type === 'text') {
      const partes = procesarTexto(hijo.value);
      if (partes) { nuevos.push(...partes); continue; }
    } else {
      caminar(hijo);
    }
    nuevos.push(hijo);
  }
  nodo.children = nuevos;
}

export default function rehypePasajes() {
  return (tree) => caminar(tree);
}
