# CineFlex Backend

API REST simulada construida con Node.js y Express. Usa Helmet para cabeceras HTTP seguras, Morgan para registros de solicitudes y JWT HS256 para autenticar la creación de reservas. Películas, asientos y reservas se almacenan en memoria; los datos se reinician al reiniciar el proceso.

## Inicio

```powershell
npm install
npm start
```

El servidor escucha en el puerto `3000` por defecto. Se puede cambiar con `PORT`.

Configura `JWT_SECRET` con una clave privada de al menos 32 bytes antes de iniciar un despliegue persistente. El servidor rechaza secretos más cortos y no inicia en `NODE_ENV=production` sin `JWT_SECRET`. En desarrollo, si no se configura, se genera una clave aleatoria temporal y los tokens dejan de ser válidos al reiniciar el servidor.

## Autenticación simulada

Credenciales por defecto:

- Correo: `demo@cineflex.com`
- Contraseña: `CineFlex2026!`

Se pueden cambiar con las variables `DEMO_EMAIL` y `DEMO_PASSWORD`. El token dura una hora. Envíalo en las rutas protegidas como `Authorization: Bearer <token>`.

## Contrato de la API

Los errores usan la estructura `{ "error": { "code": "...", "message": "..." } }`.

### `POST /api/login`

Solicitud:

```json
{
  "email": "demo@cineflex.com",
  "password": "CineFlex2026!"
}
```

Respuesta `200 OK`:

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "usuario": {
    "id": "usuario-demo",
    "email": "demo@cineflex.com"
  }
}
```

Credenciales incorrectas producen `401`; campos vacíos o ausentes producen `400`.

### `GET /api/peliculas`

Respuesta `200 OK`:

```json
{
  "peliculas": [
    {
      "id": "peli-001",
      "titulo": "El viaje estelar",
      "genero": "Ciencia ficción",
      "duracion": 128,
      "clasificacion": "PG-13",
      "sinopsis": "Una misión inesperada lleva a su tripulación más allá de lo conocido.",
      "precio": 12000
    }
  ]
}
```

La cartelera incluye tres películas de datos simulados.

### `GET /api/asientos?peliculaId=peli-001`

`peliculaId` es opcional y por defecto usa `peli-001`. Respuesta `200 OK`:

```json
{
  "peliculaId": "peli-001",
  "asientos": [
    { "id": "A1", "fila": "A", "numero": 1, "disponible": true }
  ]
}
```

Cada película tiene 50 asientos simulados. Una película inexistente produce `404`.

### `POST /api/reservas`

Requiere autenticación Bearer. Solicitud:

```json
{
  "peliculaId": "peli-001",
  "asientos": ["A1", "A2"]
}
```

Respuesta `201 Created`:

```json
{
  "reserva": {
    "id": "<uuid>",
    "peliculaId": "peli-001",
    "asientos": ["A1", "A2"],
    "usuarioId": "usuario-demo",
    "fecha": "<fecha ISO 8601>"
  }
}
```

Se permiten de uno a ocho asientos existentes y disponibles por solicitud. Sin token se responde `401`, con datos inválidos `400`, con película inexistente `404` y con asientos ya reservados `409`.

## Pruebas

```powershell
npm test
```
