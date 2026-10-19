const crypto = require('node:crypto');
const express = require('express');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');

const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const JWT_ISSUER = 'cineflex-api';
const JWT_AUDIENCE = 'cineflex-client';
const JWT_TTL_SECONDS = 60 * 60;
const configuredJwtSecret = process.env.JWT_SECRET;

if (process.env.NODE_ENV === 'production' && !configuredJwtSecret) {
  throw new Error('JWT_SECRET debe configurarse en producción.');
}
if (configuredJwtSecret && Buffer.byteLength(configuredJwtSecret, 'utf8') < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 bytes.');
}

const jwtSecret = configuredJwtSecret || crypto.randomBytes(32).toString('hex');

if (require.main === module && !configuredJwtSecret) {
  console.warn('JWT_SECRET no está configurado; se usará una clave temporal para este proceso.');
}

const demoUser = {
  id: 'usuario-demo',
  email: (process.env.DEMO_EMAIL || 'demo@cineflex.com').trim().toLowerCase(),
  password: process.env.DEMO_PASSWORD || 'CineFlex2026!',
};

const peliculas = [
  {
    id: 'peli-001',
    titulo: 'El viaje estelar',
    genero: 'Ciencia ficción',
    duracion: 128,
    clasificacion: 'PG-13',
    sinopsis: 'Una misión inesperada lleva a su tripulación más allá de lo conocido.',
    precio: 12000,
  },
  {
    id: 'peli-002',
    titulo: 'Misterio en la ciudad',
    genero: 'Suspenso',
    duracion: 104,
    clasificacion: 'PG-13',
    sinopsis: 'Una detective sigue pistas que conectan varios sucesos inexplicables.',
    precio: 11000,
  },
  {
    id: 'peli-003',
    titulo: 'Aventura bajo el mar',
    genero: 'Aventura',
    duracion: 96,
    clasificacion: 'PG',
    sinopsis: 'Dos amigos descubren un mundo sorprendente en las profundidades.',
    precio: 10000,
  },
];

const filas = ['A', 'B', 'C', 'D', 'E'];
const asientosPorPelicula = new Map(
  peliculas.map((pelicula) => [
    pelicula.id,
    filas.flatMap((fila) =>
      Array.from({ length: 10 }, (_, index) => ({
        id: `${fila}${index + 1}`,
        fila,
        numero: index + 1,
        disponible: true,
      })),
    ),
  ]),
);
const reservas = [];

function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function requireAuthentication(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Se requiere un token Bearer válido.');
  }

  try {
    const payload = jwt.verify(match[1], jwtSecret, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (payload.sub !== demoUser.id || payload.email !== demoUser.email) {
      return sendError(res, 401, 'INVALID_TOKEN', 'El token no es válido.');
    }

    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return sendError(res, 401, 'INVALID_TOKEN', 'El token no es válido o ha expirado.');
    }
    return next(error);
  }
}

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'email y password son obligatorios.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const suppliedPasswordHash = crypto.createHash('sha256').update(password).digest();
  const expectedPasswordHash = crypto.createHash('sha256').update(demoUser.password).digest();
  const validCredentials =
    normalizedEmail === demoUser.email &&
    crypto.timingSafeEqual(suppliedPasswordHash, expectedPasswordHash);

  if (!validCredentials) {
    return sendError(res, 401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.');
  }

  const token = jwt.sign({ email: demoUser.email }, jwtSecret, {
    algorithm: 'HS256',
    subject: demoUser.id,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: JWT_TTL_SECONDS,
  });

  return res.status(200).json({
    token,
    tokenType: 'Bearer',
    expiresIn: JWT_TTL_SECONDS,
    usuario: { id: demoUser.id, email: demoUser.email },
  });
});

app.get('/api/peliculas', (req, res) => {
  return res.status(200).json({ peliculas });
});

app.get('/api/asientos', (req, res) => {
  const peliculaId = req.query.peliculaId || peliculas[0].id;
  const asientos = asientosPorPelicula.get(peliculaId);

  if (!asientos) {
    return sendError(res, 404, 'MOVIE_NOT_FOUND', 'No se encontró la película solicitada.');
  }

  return res.status(200).json({
    peliculaId,
    asientos: asientos.map((asiento) => ({ ...asiento })),
  });
});

app.post('/api/reservas', requireAuthentication, (req, res) => {
  const { peliculaId, asientos } = req.body || {};

  if (
    typeof peliculaId !== 'string' ||
    !Array.isArray(asientos) ||
    asientos.length === 0 ||
    asientos.length > 8 ||
    asientos.some((asiento) => typeof asiento !== 'string' || !asiento.trim())
  ) {
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      'peliculaId y un arreglo de entre 1 y 8 identificadores de asientos son obligatorios.',
    );
  }

  if (new Set(asientos).size !== asientos.length) {
    return sendError(res, 400, 'DUPLICATE_SEATS', 'No se pueden repetir asientos en una reserva.');
  }

  const seats = asientosPorPelicula.get(peliculaId);
  if (!seats) {
    return sendError(res, 404, 'MOVIE_NOT_FOUND', 'No se encontró la película solicitada.');
  }

  const requestedSeats = asientos.map((seatId) => seats.find((seat) => seat.id === seatId));
  if (requestedSeats.some((seat) => !seat)) {
    return sendError(res, 400, 'INVALID_SEAT', 'Uno o más asientos no existen para esta película.');
  }
  if (requestedSeats.some((seat) => !seat.disponible)) {
    return sendError(res, 409, 'SEAT_UNAVAILABLE', 'Uno o más asientos ya no están disponibles.');
  }

  requestedSeats.forEach((seat) => {
    seat.disponible = false;
  });

  const reserva = {
    id: crypto.randomUUID(),
    peliculaId,
    asientos: [...asientos],
    usuarioId: req.user.id,
    fecha: new Date().toISOString(),
  };
  reservas.push(reserva);

  return res.status(201).json({ reserva });
});

app.use((req, res) => sendError(res, 404, 'NOT_FOUND', 'La ruta solicitada no existe.'));

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return sendError(res, 400, 'INVALID_JSON', 'El cuerpo de la solicitud debe ser JSON válido.');
  }
  if (error.type === 'entity.too.large') {
    return sendError(res, 413, 'PAYLOAD_TOO_LARGE', 'El cuerpo de la solicitud excede el límite permitido.');
  }

  console.error('Error interno al procesar la solicitud:', error);
  return sendError(res, 500, 'INTERNAL_ERROR', 'Ocurrió un error interno.');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CineFlex API disponible en http://localhost:${PORT}`);
  });
}

module.exports = app;