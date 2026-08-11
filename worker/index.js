// Worker del libro de actas: sirve el sitio estático y recibe observaciones de lectores.

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ---- Recibir una observación (privada) ----
    if (url.pathname === '/api/observacion' && request.method === 'POST') {
      let d;
      try { d = await request.json(); } catch { return json({ error: 'cuerpo inválido' }, 400); }
      if (d.web) return json({ ok: true }); // honeypot: los bots lo llenan, los humanos no lo ven
      const comentario = String(d.comentario || '').trim();
      if (comentario.length < 5 || comentario.length > 4000) return json({ error: 'comentario fuera de rango' }, 400);
      const fila = {
        id: crypto.randomUUID(),
        fecha: new Date().toISOString(),
        acta: String(d.acta || '').slice(0, 120),
        seccion: String(d.seccion || '').slice(0, 200),
        cita: String(d.cita || '').slice(0, 1200),
        comentario: comentario,
        nombre: String(d.nombre || '').slice(0, 120),
        contacto: String(d.contacto || '').slice(0, 200),
        url: String(d.url || '').slice(0, 300),
      };
      await env.DB.prepare(
        `INSERT INTO observaciones (id, fecha, acta, seccion, cita, comentario, nombre, contacto, url)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
      ).bind(fila.id, fila.fecha, fila.acta, fila.seccion, fila.cita, fila.comentario, fila.nombre, fila.contacto, fila.url).run();
      return json({ ok: true });
    }

    // ---- Leerlas (solo tú, con tu clave) ----
    if (url.pathname === '/api/observaciones' && request.method === 'GET') {
      if (!env.CLAVE || url.searchParams.get('clave') !== env.CLAVE) return env.ASSETS.fetch(request);
      const { results } = await env.DB.prepare('SELECT * FROM observaciones ORDER BY fecha DESC LIMIT 500').all();
      const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const filas = results.map((r) => `
        <article style="border:1px solid #ddd;padding:1rem;margin:0 0 1rem">
          <p style="margin:0;font-size:.8rem;color:#666">${esc(r.fecha)} · <b>${esc(r.acta)}</b> ${r.seccion ? '· §' + esc(r.seccion) : ''} · estado: ${esc(r.estado)}</p>
          ${r.cita ? `<blockquote style="margin:.6rem 0;padding-left:.8rem;border-left:3px solid #9c2b23;color:#555">${esc(r.cita)}</blockquote>` : ''}
          <p style="margin:.4rem 0">${esc(r.comentario)}</p>
          <p style="margin:0;font-size:.8rem;color:#666">${esc(r.nombre) || 'Anónimo'}${r.contacto ? ' · ' + esc(r.contacto) : ''} ${r.url ? `· <a href="${esc(r.url)}">ver en el sitio</a>` : ''}</p>
        </article>`).join('');
      return new Response(
        `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="robots" content="noindex">
         <title>Observaciones</title><body style="font-family:Georgia,serif;max-width:44rem;margin:2rem auto;padding:0 1rem">
         <h1 style="color:#9c2b23">Observaciones de lectores (${results.length})</h1>${filas || '<p>Ninguna todavía.</p>'}</body></html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return env.ASSETS.fetch(request);
  },
};
