# Módulo de Contacto y PQRS - Tiendas D2

Sitio de atención al cliente con formulario responsivo para consultas y PQRS (incluida la sede Ipiales). Las solicitudes se guardan en una base de datos SQLite a través de un servidor Node.js.

## Estructura

```
tiendas-d2-contacto/
├── index.html          Formulario
├── admin.html          Lista de solicitudes guardadas
├── css/styles.css
├── js/main.js
├── img/ipiales.jpg
├── database/schema.sql Esquema de la base de datos
├── server.js           Servidor Express + SQLite
├── package.json
└── README.md
```

## Cómo ejecutarlo

Requiere [Node.js](https://nodejs.org) 18 o superior.

```
npm install
npm start
```

- Formulario: http://localhost:3000
- Solicitudes guardadas: http://localhost:3000/admin

La base de datos (`database/solicitudes.db`) se crea sola al iniciar el servidor.

## Base de datos

Tabla `solicitudes`: id, nombre, email, telefono, tipo, mensaje, adjunto_nombre, adjunto_tamano, acepta_politica, creado_en. El esquema está en `database/schema.sql`.

API:
- `POST /api/solicitudes` guarda una solicitud (valida los datos también en el servidor).
- `GET /api/solicitudes` lista las solicitudes guardadas.

## Tecnologías

- HTML5 semántico, CSS3 (Grid y Flexbox, Mobile-First) y JavaScript ES6 sin librerías.
- Node.js, Express y SQLite (better-sqlite3).
- Tipografías Archivo y Source Sans 3 (Google Fonts, con respaldo del sistema).

## Validaciones

- Campos obligatorios, correo válido, teléfono solo números (7 a 10 dígitos), mensaje de 10 a 500 caracteres y política de datos aceptada.
- Errores junto a cada campo, corrección en vivo y validación repetida en el servidor.
- Archivo adjunto opcional (simulado): PDF, Word, JPG o PNG de hasta 5 MB. Se guarda solo el nombre y el tamaño.

## Recomendaciones de mantenimiento

- Para cambiar a MySQL o PostgreSQL, reemplaza la conexión y las consultas en `server.js`.
- Para agregar un tipo de solicitud, actualiza el `<select>`, las tarjetas, `TEXTOS_POR_TIPO` en `js/main.js`, el `CHECK` de `schema.sql` y `TIPOS` en `server.js`.
- Protege `/admin` con autenticación antes de publicarlo.
- Haz copias de seguridad de `database/solicitudes.db`.

## Control de versiones

```
git init
git add .
git commit -m "feat: módulo de contacto y PQRS con base de datos"
git branch -M main
git remote add origin <url-del-repositorio>
git push -u origin main
```
