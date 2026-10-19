const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const app = require('../server');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test('API ofrece cartelera, autenticación JWT y reservas protegidas', async () => {
  const moviesResponse = await fetch(`${baseUrl}/api/peliculas`);
  assert.equal(moviesResponse.status, 200);
  assert.equal(moviesResponse.headers.get('x-content-type-options'), 'nosniff');
  const moviesBody = await moviesResponse.json();
  assert.equal(moviesBody.peliculas.length, 3);
  assert.equal(moviesBody.peliculas[0].id, 'peli-001');

  const seatsResponse = await fetch(`${baseUrl}/api/asientos?peliculaId=peli-001`);
  assert.equal(seatsResponse.status, 200);
  const seatsBody = await seatsResponse.json();
  assert.equal(seatsBody.asientos.length, 50);
  assert.equal(seatsBody.asientos[0].disponible, true);

  const missingLoginFieldsResponse = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'demo@cineflex.com' }),
  });
  assert.equal(missingLoginFieldsResponse.status, 400);

  const unknownMovieSeatsResponse = await fetch(`${baseUrl}/api/asientos?peliculaId=desconocida`);
  assert.equal(unknownMovieSeatsResponse.status, 404);

  const unauthorizedResponse = await fetch(`${baseUrl}/api/reservas`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ peliculaId: 'peli-001', asientos: ['A1'] }),
  });
  assert.equal(unauthorizedResponse.status, 401);

  const invalidTokenResponse = await fetch(`${baseUrl}/api/reservas`, {
    method: 'POST',
    headers: {
      authorization: 'Bearer token-invalido',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ peliculaId: 'peli-001', asientos: ['A1'] }),
  });
  assert.equal(invalidTokenResponse.status, 401);

  const invalidLoginResponse = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'demo@cineflex.com', password: 'incorrecta' }),
  });
  assert.equal(invalidLoginResponse.status, 401);

  const loginResponse = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'demo@cineflex.com', password: 'CineFlex2026!' }),
  });
  assert.equal(loginResponse.status, 200);
  const loginBody = await loginResponse.json();
  assert.equal(loginBody.tokenType, 'Bearer');
  assert.equal(loginBody.expiresIn, 3600);
  assert.ok(loginBody.token);

  const invalidSeatsResponse = await fetch(`${baseUrl}/api/reservas`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${loginBody.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ peliculaId: 'peli-001', asientos: ['Z99'] }),
  });
  assert.equal(invalidSeatsResponse.status, 400);

  const duplicateSeatsResponse = await fetch(`${baseUrl}/api/reservas`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${loginBody.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ peliculaId: 'peli-001', asientos: ['A1', 'A1'] }),
  });
  assert.equal(duplicateSeatsResponse.status, 400);

  const tooManySeatsResponse = await fetch(`${baseUrl}/api/reservas`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${loginBody.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      peliculaId: 'peli-001',
      asientos: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'],
    }),
  });
  assert.equal(tooManySeatsResponse.status, 400);

  const reservationResponse = await fetch(`${baseUrl}/api/reservas`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${loginBody.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ peliculaId: 'peli-001', asientos: ['A1', 'A2'] }),
  });
  assert.equal(reservationResponse.status, 201);
  const reservationBody = await reservationResponse.json();
  assert.deepEqual(reservationBody.reserva.asientos, ['A1', 'A2']);
  assert.equal(reservationBody.reserva.usuarioId, 'usuario-demo');

  const duplicateReservationResponse = await fetch(`${baseUrl}/api/reservas`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${loginBody.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ peliculaId: 'peli-001', asientos: ['A1'] }),
  });
  assert.equal(duplicateReservationResponse.status, 409);

  const updatedSeatsResponse = await fetch(`${baseUrl}/api/asientos?peliculaId=peli-001`);
  const updatedSeatsBody = await updatedSeatsResponse.json();
  assert.equal(updatedSeatsBody.asientos[0].disponible, false);
  assert.equal(updatedSeatsBody.asientos[1].disponible, false);
});
