# Libro de actas · *Un pueblo, un pacto, una venida*

Sitio estático (Astro) para publicar actas teológicas como edición enriquecida: notas al margen estilo Tufte, glosas de hebreo/griego con popover, tablas careo interactivas e índice de pasajes generado automáticamente.

## Correr en local

Requisitos: Node 20+ (probado con Node 22).

```bash
npm install
npm run dev        # abre http://localhost:4321
npm run build      # genera el sitio estático en dist/
```

## Escribir una acta

Cada acta es un archivo `.mdx` en `src/content/actas/`. El frontmatter mínimo:

```yaml
---
titulo: "Título de la acta"
subtitulo: "Opcional"
orden: 3              # define el numeral romano (3 → III) y el orden en la portada
loci: "Cristología"
fecha: 2026-09-01
resumen: "Una o dos líneas que aparecen en el registro de la portada."
pasajes:              # alimenta el índice global /indice-pasajes
  - "Isaías 53:5"
  - "Juan 1:14"
borrador: true        # true = no se publica; cámbialo a false al terminar
---
```

El cuerpo es Markdown normal. Los tres componentes están disponibles sin importar nada:

```mdx
Texto con una nota al margen<Nota>El apunte crítico va aquí.</Nota> y sigue el argumento.

La palabra <Gloss palabra="בְּרִית" translit="berit" es="pacto" ref="Gn 15:18" lang="he" /> aparece glosada.

<Careo
  titulo="Careo · Posturas sobre X"
  criterios={["Tesis", "Texto apelado", "Observación"]}
  posturas={[
    { nombre: "Postura A", celdas: ["…", "…", "…"] },
    { nombre: "Postura B", celdas: ["…", "…", "…"] },
  ]}
/>
```

- `<Nota>` — numeración automática; en pantalla ancha flota al margen, en móvil se abre al tocar el número.
- `<Gloss>` — `lang="he"` muestra la palabra en dirección RTL; `lang="grc"` para griego. Fuente Gentium Plus (diacríticos bíblicos completos).
- `<Careo>` — los chips permiten al lector ocultar/mostrar posturas para comparar de a dos.

## Publicar en Cloudflare Pages

1. Sube este directorio a un repositorio de GitHub (privado o público).
2. En el dashboard de Cloudflare: **Workers & Pages → Create → Pages → Connect to Git** y elige el repo.
3. Configuración de build: framework *Astro*, comando `npm run build`, directorio de salida `dist`.
4. Cada `git push` a `main` publica automáticamente; las ramas generan URLs de preview.
5. Dominio propio: **Custom domains** en el proyecto de Pages y apunta el DNS.

Cuando tengas dominio, actualiza `site` en `astro.config.mjs`.

## Estructura

```
src/
  content/actas/       ← tus actas (.mdx)
  components/          ← Nota, Gloss, Careo
  pages/index.astro    ← portada: registro de actas
  pages/actas/[...slug].astro
  pages/indice-pasajes.astro  ← índice bíblico autogenerado
  styles/global.css    ← tokens de diseño (colores, tipografía)
  lib/util.ts          ← numerales romanos, orden canónico
```

Para ajustar la paleta o la tipografía, todo vive en las variables al inicio de `src/styles/global.css`.

## Aparato de lectura (v9)

- **Popovers bíblicos**: toda cita "Libro C:V" se detecta en compilación y muestra el pasaje (RVA 1909, dominio público) al pasar el cursor, con enlace de cotejo a RVR60. Los textos viven en `public/biblia/*.json` — para cambiar de versión, reemplaza esos archivos conservando el formato `{nombre, capitulos: {c: {v: texto}}}`.
- **Modos de lectura**: papel / sepia / noche (botón ◐ en la cabecera; recuerda la preferencia).
- **Componentes**: `<Epigrafe fuente="…">cita</Epigrafe>` y `<Plegable titulo="…">contenido</Plegable>` disponibles en cualquier acta.
- **Frontmatter**: campo opcional `estado:` (p. ej. "Vigente", "En reposo deliberado") visible en la cabecera.
