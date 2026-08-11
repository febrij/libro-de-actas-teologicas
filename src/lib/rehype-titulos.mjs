// Auto-enlaza menciones de otras actas por su título exacto (nunca a sí misma).
import mapa from './titulos-mapa.json' with { type: 'json' };

const OMITIR = new Set(['a', 'code', 'pre', 'script', 'style', 'h1']);
const titulos = Object.keys(mapa).sort((a, b) => b.length - a.length);

export default function rehypeTitulos() {
  return (tree, file) => {
    const ruta = String(file?.path || '');
    const propios = titulos.filter((t) => !ruta.includes(mapa[t].split('/').pop()));
    if (!propios.length) return;
    caminar(tree, propios);
  };
}

function caminar(nodo, propios) {
  if (!nodo.children) return;
  if (nodo.type === 'element') {
    if (OMITIR.has(nodo.tagName)) return;
    const cls = nodo.properties?.className;
    if (Array.isArray(cls) && (cls.includes('pas') || cls.includes('gloss'))) return;
  }
  const nuevos = [];
  for (const hijo of nodo.children) {
    if (hijo.type === 'text') {
      const partes = partir(hijo.value, propios);
      if (partes) { nuevos.push(...partes); continue; }
    } else {
      caminar(hijo, propios);
    }
    nuevos.push(hijo);
  }
  nodo.children = nuevos;
}

function partir(valor, propios) {
  for (const t of propios) {
    const i = valor.indexOf(t);
    if (i === -1) continue;
    const partes = [];
    if (i > 0) partes.push({ type: 'text', value: valor.slice(0, i) });
    partes.push({ type: 'element', tagName: 'a', properties: { href: mapa[t], className: ['enlace-acta'] },
                  children: [{ type: 'text', value: t }] });
    const resto = valor.slice(i + t.length);
    const mas = partir(resto, propios);
    if (mas) partes.push(...mas); else if (resto) partes.push({ type: 'text', value: resto });
    return partes;
  }
  return null;
}
