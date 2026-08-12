// Detecta secuencias en escritura griega o hebrea dentro de las actas y las
// envuelve en <span class="orig"> para que el lector pueda escuchar su
// pronunciación al pasar el cursor. El texto del autor no se modifica.

const GRIEGO = '\\u0370-\\u03FF\\u1F00-\\u1FFF';
const HEBREO = '\\u0590-\\u05FF';
// Una "frase" en la escritura: palabras del alfabeto unidas por espacios o puntuación ligera
const RE = new RegExp(
  `([${GRIEGO}][${GRIEGO}\\u0300-\\u036F]*(?:[\\s\\u00A0'’,·;][${GRIEGO}][${GRIEGO}\\u0300-\\u036F]*)*)` +
  `|([${HEBREO}][${HEBREO}]*(?:[\\s\\u00A0\\u05BE][${HEBREO}][${HEBREO}]*)*)`,
  'gu'
);

const OMITIR = new Set(['a', 'code', 'pre', 'script', 'style']);

function procesar(valor) {
  const partes = [];
  let ultimo = 0;
  for (const m of valor.matchAll(RE)) {
    const texto = m[0];
    if (texto.replace(/[\s\u00A0]/g, '').length < 2) continue; // letras sueltas no
    const esGriego = !!m[1];
    if (m.index > ultimo) partes.push({ type: 'text', value: valor.slice(ultimo, m.index) });
    partes.push({
      type: 'element',
      tagName: 'span',
      properties: {
        className: ['orig'],
        lang: esGriego ? 'grc' : 'he',
        dir: esGriego ? 'ltr' : 'rtl',
        translate: 'no',
        tabIndex: 0,
        title: 'Escuchar pronunciación',
      },
      children: [{ type: 'text', value: texto }],
    });
    ultimo = m.index + texto.length;
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
    if (Array.isArray(cls) && (cls.includes('gloss') || cls.includes('pas') || cls.includes('orig'))) return;
  }
  const nuevos = [];
  for (const hijo of nodo.children) {
    if (hijo.type === 'text') {
      const partes = procesar(hijo.value);
      if (partes) { nuevos.push(...partes); continue; }
    } else {
      caminar(hijo);
    }
    nuevos.push(hijo);
  }
  nodo.children = nuevos;
}

export default function rehypeOriginal() {
  return (tree) => caminar(tree);
}
