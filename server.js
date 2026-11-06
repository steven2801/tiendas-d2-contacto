const express = require('express');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 3000;
const RUTA_BD = path.join(__dirname, 'database', 'solicitudes.db');
const RUTA_ESQUEMA = path.join(__dirname, 'database', 'schema.sql');

// Conexión a la base de datos y creación de la tabla si no existe
const db = new Database(RUTA_BD);
db.exec(fs.readFileSync(RUTA_ESQUEMA, 'utf8'));

const insertarSolicitud = db.prepare(`
  INSERT INTO solicitudes (nombre, email, telefono, tipo, mensaje, adjunto_nombre, adjunto_tamano, acepta_politica)
  VALUES (@nombre, @email, @telefono, @tipo, @mensaje, @adjunto_nombre, @adjunto_tamano, 1)
`);
const listarSolicitudes = db.prepare('SELECT * FROM solicitudes ORDER BY id DESC');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TIPOS = ['consulta', 'pqrs'];

// Validación en el servidor (no se confía solo en el navegador)
function validar(datos) {
  const errores = {};
  const nombre = String(datos.nombre || '').trim();
  const email = String(datos.email || '').trim();
  const telefono = String(datos.telefono || '').trim();
  const mensaje = String(datos.mensaje || '').trim();

  if (nombre.length < 3 || nombre.length > 80) errores.nombre = 'Nombre inválido.';
  if (!EMAIL_REGEX.test(email)) errores.email = 'Correo inválido.';
  if (!/^[0-9]{7,10}$/.test(telefono)) errores.telefono = 'Teléfono inválido.';
  if (!TIPOS.includes(datos.tipo)) errores.tipo = 'Tipo de solicitud inválido.';
  if (mensaje.length < 10 || mensaje.length > 500) errores.mensaje = 'Mensaje inválido.';
  if (datos.politica !== true) errores.politica = 'Debes aceptar la política de datos.';

  return { errores, limpio: { nombre, email, telefono, tipo: datos.tipo, mensaje } };
}

const app = express();
app.use(express.json({ limit: '50kb' }));

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

app.post('/api/solicitudes', (req, res) => {
  const { errores, limpio } = validar(req.body || {});
  if (Object.keys(errores).length) return res.status(400).json({ ok: false, errores });

  const adjunto = req.body.adjunto || {};
  const resultado = insertarSolicitud.run({
    ...limpio,
    adjunto_nombre: adjunto.nombre ? String(adjunto.nombre).slice(0, 150) : null,
    adjunto_tamano: Number.isInteger(adjunto.tamano) ? adjunto.tamano : null
  });

  res.status(201).json({ ok: true, id: resultado.lastInsertRowid });
});

app.get('/api/solicitudes', (req, res) => {
  res.json(listarSolicitudes.all());
});

app.listen(PORT, () => {
  console.log('Tiendas D2 en http://localhost:' + PORT);
  console.log('Solicitudes guardadas en http://localhost:' + PORT + '/admin');
});
