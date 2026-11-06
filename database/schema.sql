CREATE TABLE IF NOT EXISTS solicitudes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('consulta', 'pqrs')),
  mensaje TEXT NOT NULL,
  adjunto_nombre TEXT,
  adjunto_tamano INTEGER,
  acepta_politica INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
