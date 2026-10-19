\# CineFlex - Proyecto de Pruebas de Calidad



\## 1. Descripción del proyecto



CineFlex integra una interfaz de usuario para la reserva de entradas de cine con pruebas de API, interfaz de usuario y rendimiento, junto con un pipeline de integración continua.



\## 2. Desarrollo del Frontend



\### Descripción



Se desarrolló la interfaz de usuario de CineFlex utilizando HTML5, CSS3 y JavaScript, conectándola con el backend existente para implementar el flujo de reserva de entradas de cine.



\### Funcionalidades implementadas



\- \*\*Inicio de sesión:\*\* formulario de autenticación conectado con la API.

\- \*\*Cartelera:\*\* visualización dinámica de las películas disponibles y sus características.

\- \*\*Selección de asientos:\*\* consulta de disponibilidad y selección de puestos para la reserva.

\- \*\*Formulario de pago:\*\* validación de campos mediante datos ficticios, sin procesar transacciones bancarias reales.

\- \*\*Tiquete virtual:\*\* visualización del identificador de la reserva, la película y los asientos seleccionados.

\- \*\*Integración con la API REST:\*\* consumo de los endpoints de autenticación, cartelera, consulta de asientos y creación de reservas.

\- \*\*Manejo de errores:\*\* presentación de mensajes informativos durante las operaciones.

\- \*\*Identificadores para automatización:\*\* utilización de identificadores estables en los elementos principales de la interfaz para facilitar su localización mediante Selenium.



\### Tecnologías utilizadas



| Tecnología | Uso |

|---|---|

| HTML5 | Estructura de la interfaz y formularios. |

| CSS3 | Estilos y presentación visual. |

| JavaScript | Interacciones, validaciones y navegación entre vistas. |

| Fetch API | Comunicación HTTP con el backend. |



\### Flujo de navegación



Inicio de sesión → Cartelera → Selección de asientos → Pago simulado → Tiquete virtual



\### Verificación funcional



Se realizó una comprobación manual del flujo principal de la aplicación, verificando el inicio de sesión, la consulta de películas, la selección de asientos y la generación de una reserva con su correspondiente tiquete virtual.



\### Consideraciones



El formulario de pago es una simulación. No se conecta con una pasarela bancaria ni procesa pagos reales.



\## 3. Requisitos



\- Node.js y npm.

\- Apache JMeter para las pruebas de rendimiento.

\- Newman para ejecutar pruebas de API.



\## 4. Iniciar el backend



Desde la raíz del proyecto, ejecuta:



```bash

cd backend

npm install

npm start

```



El servidor utiliza el puerto 3000 de forma predeterminada.



\## 5. Endpoints de API



\- `POST /api/login`: inicio de sesión.

\- `GET /api/peliculas`: consulta de películas.

\- `GET /api/asientos?peliculaId=peli-001`: consulta de asientos.

\- `POST /api/reservas`: creación de reservas con autenticación Bearer.



\## 6. Pruebas de API



La colección y el entorno de Postman se encuentran en `api\_tests/`.



Para ejecutar las pruebas con Newman:



```bash

npx newman run api\_tests/CineFlex\_API\_Collection.json -e api\_tests/CineFlex\_Environment.json

```



Comprueba que la colección y el entorno estén configurados antes de ejecutar las pruebas.



\## 7. Pruebas de rendimiento



El plan de carga se encuentra en `performance/prueba\_carga.jmx`.



Abre el archivo con Apache JMeter, inicia el backend y ejecuta la prueba en un entorno controlado. Registra los resultados reales antes de establecer conclusiones.



\## 8. Integración continua



El pipeline se encuentra en `.github/workflows/qa-pipeline.yml` y automatiza la preparación del entorno y la ejecución de pruebas de API.



\## 9. Estrategia de pruebas



El documento `estrategia\_pruebas.pdf` describe los requisitos, las pruebas propuestas y los criterios de aceptación.



\## 10. Evidencias



Documenta los resultados reales de las pruebas una vez ejecutadas. No registres resultados estimados como mediciones reales.



\## 11. Responsabilidad del Integrante 4



\- Pruebas de rendimiento.

\- Integración continua.

\- Documentación del proyecto.

\- Estrategia de pruebas.



Los archivos de backend, frontend y las suites de pruebas de otros integrantes permanecen bajo la responsabilidad de sus respectivos autores.

