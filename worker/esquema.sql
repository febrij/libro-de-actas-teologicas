CREATE TABLE IF NOT EXISTS observaciones (
  id TEXT PRIMARY KEY,
  fecha TEXT NOT NULL,
  acta TEXT NOT NULL,
  seccion TEXT,
  cita TEXT,
  comentario TEXT NOT NULL,
  nombre TEXT,
  contacto TEXT,
  url TEXT,
  estado TEXT NOT NULL DEFAULT 'nueva'
);
