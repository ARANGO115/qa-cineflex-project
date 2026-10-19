# CineFlex - Proyecto de Pruebas de Calidad

## Descripción
CineFlex integra pruebas de API, interfaz de usuario y rendimiento, junto con un pipeline de integración continua.

## Requisitos
- Node.js y npm.
- Apache JMeter para las pruebas de rendimiento.
- Newman para ejecutar pruebas de API.

## Iniciar el backend
Desde la raíz del proyecto, ejecuta:

```bash
cd backend
npm install
npm start
```

El servidor utiliza el puerto 3000 de forma predeterminada.

## Endpoints de API
- `POST /api/login`: inicio de sesión.
- `GET /api/peliculas`: consulta de películas.
- `GET /api/asientos?peliculaId=peli-001`: consulta de asientos.
- `POST /api/reservas`: creación de reservas con autenticación Bearer.

## Pruebas de API
La colección y el entorno de Postman se encuentran en `api_tests/`.

```bash
npx newman run api_tests/CineFlex_API_Collection.json -e api_tests/CineFlex_Environment.json
```

Comprueba que la colección y el entorno estén configurados antes de ejecutar las pruebas.

## Pruebas de rendimiento
El plan de carga se encuentra en `performance/prueba_carga.jmx`.
Abre el archivo con Apache JMeter, inicia el backend y ejecuta la prueba en un entorno controlado. Registra los resultados reales antes de establecer conclusiones.

## Integración continua
El pipeline se encuentra en `.github/workflows/qa-pipeline.yml` y automatiza la preparación del entorno y la ejecución de pruebas de API.

## Estrategia de pruebas
El documento `estrategia_pruebas.pdf` describe los requisitos, las pruebas propuestas y los criterios de aceptación.

## Evidencias
Documenta los resultados reales de las pruebas una vez ejecutadas. No registres resultados estimados como mediciones reales.

## Responsabilidad del Integrante 4
- Pruebas de rendimiento.
- Integración continua.
- Documentación del proyecto.
- Estrategia de pruebas.

Los archivos de backend, frontend y las suites de pruebas de otros integrantes permanecen bajo la responsabilidad de sus respectivos autores.
