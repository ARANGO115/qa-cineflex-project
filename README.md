# qa-cineflex-project}

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

### Consideraciones

El formulario de pago es una simulación. No se conecta con una pasarela bancaria ni procesa pagos reales.
