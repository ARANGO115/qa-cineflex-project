# qa-cineflex-project

## Backend y API REST

API REST simulada construida con Node.js y Express. Usa Helmet para cabeceras HTTP seguras, Morgan para registros de solicitudes y JWT HS256 para autenticar la creación de reservas. Películas, asientos y reservas se almacenan en memoria; los datos se reinician al reiniciar el proceso.

## Inicio

**Importante:** ejecuta estos comandos desde la carpeta `backend/`.

```bash
npm install
npm start
```

Y para correr las pruebas, también desde esa misma carpeta:

```bash
npm test
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


## 2. Desarrollo del Frontend

### Descripción

Se desarrolló la interfaz de usuario de CineFlex utilizando HTML5, CSS3 y JavaScript, conectándola con el backend existente para implementar el flujo de reserva de entradas de cine.

### Funcionalidades implementadas

- **Inicio de sesión:** formulario de autenticación conectado con la API.
- **Cartelera:** visualización dinámica de las películas disponibles y sus características.
- **Selección de asientos:** consulta de disponibilidad y selección de puestos para la reserva.
- **Formulario de pago:** validación de campos mediante datos ficticios, sin procesar transacciones bancarias reales.
- **Tiquete virtual:** visualización del identificador de la reserva, la película y los asientos seleccionados.
- **Integración con la API REST:** consumo de los endpoints de autenticación, cartelera, consulta de asientos y creación de reservas.
- **Manejo de errores:** presentación de mensajes informativos durante las operaciones.
- **Identificadores para automatización:** utilización de identificadores estables en los elementos principales de la interfaz para facilitar su localización mediante Selenium.

### Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura de la interfaz y formularios. |
| CSS3 | Estilos y presentación visual. |
| JavaScript | Interacciones, validaciones y navegación entre vistas. |
| Fetch API | Comunicación HTTP con el backend. |

### Flujo de navegación

Inicio de sesión → Cartelera → Selección de asientos → Pago simulado → Tiquete virtual

### Verificación funcional

Se realizó una comprobación manual del flujo principal de la aplicación, verificando el inicio de sesión, la consulta de películas, la selección de asientos y la generación de una reserva con su correspondiente tiquete virtual.

### Pruebas automatizadas de interfaz

Las pruebas Selenium utilizan el frontend servido por **Open Live Server** en el puerto `5500` y la API en el puerto `3000`. Desde la raíz del repositorio:

1. Inicia la API en una terminal:

   ```powershell
   npm --prefix backend start
   ```

2. Abre `frontend/index.html` con **Open with Live Server** en VS Code. Si Live Server sirve la raíz del repositorio, la URL esperada es `http://127.0.0.1:5500/frontend/index.html`.
3. En otra terminal, ejecuta la suite:

   ```powershell
   npm run test:ui
   ```

Mocha ejecuta los 15 casos con Selenium y Chrome. La suite comprueba primero que Live Server y la API estén disponibles y muestra cuál falta iniciar. Se puede cambiar la URL del frontend con `UI_BASE_URL`, la de la API con `UI_API_URL` y el navegador con `SELENIUM_BROWSER`. Las credenciales usan por defecto `demo@cineflex.com` y `CineFlex2026!`; se pueden configurar mediante `DEMO_EMAIL` y `DEMO_PASSWORD`.

### Consideraciones

El formulario de pago es una simulación. No se conecta con una pasarela bancaria ni procesa pagos reales.


## 4. Pruebas de rendimiento

Se utilizó Apache JMeter para evaluar el comportamiento del endpoint de consulta de asientos ante múltiples solicitudes concurrentes.

- **Plan de pruebas:** `performance/prueba_carga.jmx`
- **Endpoint evaluado:** `GET /api/asientos?peliculaId=peli-001`
- **Usuarios concurrentes configurados:** 500
- **Tiempo de ramp-up:** 15 segundos
- **Iteraciones:** 5
- **Solicitudes ejecutadas:** 2.500
- **Tiempo promedio de respuesta:** 2 ms
- **Tiempo máximo de respuesta:** 98 ms
- **Porcentaje de errores:** 0 %
- **Rendimiento registrado:** 169,9 solicitudes por segundo
- **Archivo de resultados:** `performance/summary.csv`

En la ejecución local realizada, JMeter completó 2.500 solicitudes sin registrar errores. Estos resultados corresponden al entorno local de pruebas y no garantizan el mismo rendimiento en producción.

## 5. Integración continua

El flujo de integración continua está definido en `.github/workflows/qa-pipeline.yml`.

El workflow utiliza GitHub Actions para preparar el entorno de Node.js, iniciar el backend y ejecutar las pruebas de API mediante Newman. Los resultados se pueden consultar en la ejecución del workflow y en los artefactos publicados, cuando estén disponibles.

## 6. Estrategia de pruebas

El documento `estrategia_pruebas.pdf` describe el alcance y la estrategia de calidad del proyecto CineFlex.

Los resultados deben verificarse mediante ejecuciones reales de las pruebas. La existencia de una configuración no implica, por sí sola, que todas las pruebas hayan sido aprobadas.
