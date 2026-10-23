"use strict";

// ============================================
// CINEFLEX - CONFIGURACIÓN
// ============================================

const API_URL = "http://localhost:3000/api";
const MAX_SEATS = 8;

// ============================================
// ELEMENTOS DEL DOM
// ============================================

const elements = {
    loginView: document.getElementById("login-view"),
    loginForm: document.getElementById("login-form"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    loginError: document.getElementById("login-error"),
    loginButton: document.getElementById("login-button"),

    carteleraView: document.getElementById("cartelera-view"),
    movieList: document.getElementById("movie-list"),
    moviesError: document.getElementById("movies-error"),

    reservaView: document.getElementById("reserva-view"),
    selectedMovie: document.getElementById("selected-movie"),
    seatMap: document.getElementById("seat-map"),
    seatError: document.getElementById("seat-error"),
    continueToPayment: document.getElementById("continue-to-payment"),

    pagoView: document.getElementById("pago-view"),
    bookingSummary: document.getElementById("booking-summary"),
    paymentForm: document.getElementById("payment-form"),
    cardholder: document.getElementById("cardholder"),
    cardNumber: document.getElementById("card-number"),
    cardExpiry: document.getElementById("card-expiry"),
    cardCvv: document.getElementById("card-cvv"),
    paymentError: document.getElementById("payment-error"),
    confirmPaymentButton: document.getElementById(
        "confirm-payment-button"
    ),

    ticketView: document.getElementById("ticket-view"),
    ticketMessage: document.getElementById("ticket-message"),
    ticketId: document.getElementById("ticket-id"),
    ticketMovie: document.getElementById("ticket-movie"),
    ticketSeats: document.getElementById("ticket-seats"),
    backToCartelera: document.getElementById("back-to-cartelera"),

    logoutButton: document.getElementById("logout-button")
};

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================

const state = {
    token: null,
    usuario: null,
    peliculas: [],
    peliculaSeleccionada: null,
    asientos: [],
    asientosSeleccionados: [],
    reservaActual: null,
    vistaActual: "login",
    procesandoReserva: false
};

// ============================================
// PETICIONES HTTP
// ============================================

async function apiRequest(endpoint, options = {}) {
    const headers = {
        Accept: "application/json",
        ...options.headers
    };

    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (state.token) {
        headers.Authorization = `Bearer ${state.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    const contentType = response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        const message =
            data?.error?.message ||
            "No fue posible completar la solicitud.";

        const error = new Error(message);

        error.status = response.status;
        error.code = data?.error?.code || "REQUEST_FAILED";

        throw error;
    }

    return data;
}

// ============================================
// NAVEGACIÓN ENTRE PANTALLAS
// ============================================

const views = {
    login: elements.loginView,
    cartelera: elements.carteleraView,
    reserva: elements.reservaView,
    pago: elements.pagoView,
    ticket: elements.ticketView
};

function showView(viewName, options = {}) {
    if (!views[viewName]) {
        throw new Error(`La vista "${viewName}" no existe.`);
    }

    Object.entries(views).forEach(([name, element]) => {
        element.hidden = name !== viewName;
    });

    state.vistaActual = viewName;

    elements.logoutButton.hidden =
        viewName === "login" || !state.token;

    // Evitar volver a una pantalla protegida mediante Atrás.
    if (options.updateHistory !== false) {
        history.pushState(
            { view: viewName },
            "",
            `#${viewName}`
        );
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ============================================
// MENSAJES
// ============================================

function showMessage(element, message, type = "error") {
    element.textContent = message;
    element.hidden = !message;

    element.classList.toggle(
        "message-error",
        type === "error" && Boolean(message)
    );

    element.classList.toggle(
        "message-success",
        type === "success" && Boolean(message)
    );
}

// ============================================
// INICIO DE SESIÓN
// ============================================

async function handleLogin(event) {
    event.preventDefault();

    showMessage(elements.loginError, "");

    const email = elements.email.value.trim();
    const password = elements.password.value;

    elements.loginButton.disabled = true;
    elements.loginButton.textContent = "Iniciando sesión...";

    try {
        const data = await apiRequest("/login", {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            })
        });

        if (!data.token) {
            throw new Error(
                "El servidor no devolvió un token de autenticación."
            );
        }

        state.token = data.token;
        state.usuario = data.usuario;

        elements.loginForm.reset();

        await loadMovies();

        showView("cartelera");

    } catch (error) {
        showMessage(
            elements.loginError,
            error.message
        );
    } finally {
        elements.loginButton.disabled = false;
        elements.loginButton.textContent = "Iniciar sesión";
    }
}

// ============================================
// CARTELERA
// ============================================

async function loadMovies() {
    elements.movieList.replaceChildren();

    showMessage(elements.moviesError, "");

    try {
        const data = await apiRequest("/peliculas");

        if (!Array.isArray(data.peliculas)) {
            throw new Error(
                "La respuesta del servidor no contiene una cartelera válida."
            );
        }

        state.peliculas = data.peliculas;

        if (state.peliculas.length === 0) {
            showMessage(
                elements.moviesError,
                "No hay películas disponibles."
            );

            return;
        }

        state.peliculas.forEach((pelicula) => {
            elements.movieList.appendChild(
                createMovieCard(pelicula)
            );
        });

    } catch (error) {
        showMessage(
            elements.moviesError,
            error.message
        );

        throw error;
    }
}

function createMovieCard(pelicula) {
    const card = document.createElement("article");

    card.className = "movie-card";
    card.dataset.movieId = pelicula.id;

    const poster = document.createElement("div");

    poster.className = "movie-poster";
    poster.setAttribute("aria-hidden", "true");

    const content = document.createElement("div");

    content.className = "movie-card-content";

    const title = document.createElement("h2");

    title.textContent = pelicula.titulo;

    const genre = document.createElement("p");

    genre.textContent = pelicula.genero;

    const duration = document.createElement("p");

    duration.textContent = `${pelicula.duracion} minutos`;

    const classification = document.createElement("p");

    classification.textContent =
        `Clasificación: ${pelicula.clasificacion}`;

    const synopsis = document.createElement("p");

    synopsis.textContent = pelicula.sinopsis;

    const price = document.createElement("p");

    price.textContent = formatCurrency(pelicula.precio);

    const button = document.createElement("button");

    button.type = "button";
    button.className = "select-movie-button";
    button.dataset.movieId = pelicula.id;
    button.textContent = "Seleccionar película";

    button.addEventListener("click", () => {
        selectMovie(pelicula.id);
    });

    content.append(
        title,
        genre,
        duration,
        classification,
        synopsis,
        price,
        button
    );

    card.append(poster, content);

    return card;
}

// ============================================
// SELECCIÓN DE PELÍCULA
// ============================================

async function selectMovie(movieId) {
    const pelicula = state.peliculas.find(
        (item) => item.id === movieId
    );

    if (!pelicula) {
        showMessage(
            elements.moviesError,
            "No se encontró la película seleccionada."
        );

        return;
    }

    state.peliculaSeleccionada = pelicula;
    state.asientosSeleccionados = [];
    state.asientos = [];

    elements.seatMap.replaceChildren();

    showMessage(elements.seatError, "");

    elements.selectedMovie.textContent =
        `${pelicula.titulo} — ${formatCurrency(pelicula.precio)} por asiento`;

    elements.continueToPayment.disabled = true;

    showView("reserva");

    await loadSeats(movieId);
}

// ============================================
// CONSULTA DE ASIENTOS
// ============================================

async function loadSeats(movieId) {
    elements.seatMap.replaceChildren();

    showMessage(elements.seatError, "Cargando asientos...");

    try {
        const data = await apiRequest(
            `/asientos?peliculaId=${encodeURIComponent(movieId)}`
        );

        if (!Array.isArray(data.asientos)) {
            throw new Error(
                "El servidor no devolvió una lista válida de asientos."
            );
        }

        state.asientos = data.asientos;

        renderSeats();

        showMessage(elements.seatError, "");

    } catch (error) {
        showMessage(
            elements.seatError,
            error.message
        );
    }
}

function renderSeats() {
    elements.seatMap.replaceChildren();

    state.asientos.forEach((asiento) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "seat";
        button.textContent = asiento.id;
        button.dataset.seatId = asiento.id;

        if (!asiento.disponible) {
            button.classList.add("occupied");
            button.disabled = true;
            button.setAttribute("aria-label", `${asiento.id}, ocupado`);
        } else {
            button.classList.add("available");

            button.setAttribute(
                "aria-label",
                `${asiento.id}, disponible`
            );

            button.setAttribute("aria-pressed", "false");

            button.addEventListener("click", () => {
                toggleSeat(asiento.id);
            });
        }

        elements.seatMap.appendChild(button);
    });

    updateBookingSummary();
}

// ============================================
// SELECCIÓN DE ASIENTOS
// ============================================

function toggleSeat(seatId) {
    showMessage(elements.seatError, "");

    const asiento = state.asientos.find(
        (item) => item.id === seatId
    );

    if (!asiento || !asiento.disponible) {
        return;
    }

    const index = state.asientosSeleccionados.indexOf(seatId);

    if (index !== -1) {
        state.asientosSeleccionados.splice(index, 1);
    } else {
        if (state.asientosSeleccionados.length >= MAX_SEATS) {
            showMessage(
                elements.seatError,
                `Solo puedes seleccionar ${MAX_SEATS} asientos por reserva.`
            );

            return;
        }

        state.asientosSeleccionados.push(seatId);
    }

    updateSeatAppearance();
    updateBookingSummary();
}

function updateSeatAppearance() {
    const buttons = elements.seatMap.querySelectorAll(".seat");

    buttons.forEach((button) => {
        const selected = state.asientosSeleccionados.includes(
            button.dataset.seatId
        );

        if (selected) {
            button.classList.remove("available");
            button.classList.add("selected");
        } else if (!button.disabled) {
            button.classList.remove("selected");
            button.classList.add("available");
        }

        button.setAttribute("aria-pressed", String(selected));
    });

    elements.continueToPayment.disabled =
        state.asientosSeleccionados.length === 0;
}

function updateBookingSummary() {
    const pelicula = state.peliculaSeleccionada;

    if (!pelicula) {
        elements.bookingSummary.replaceChildren();

        return;
    }

    const total =
        pelicula.precio * state.asientosSeleccionados.length;

    elements.bookingSummary.replaceChildren(
        createSummaryLine("Película", pelicula.titulo),
        createSummaryLine(
            "Asientos",
            state.asientosSeleccionados.length > 0
                ? state.asientosSeleccionados.join(", ")
                : "Ninguno seleccionado"
        ),
        createSummaryLine(
            "Cantidad",
            String(state.asientosSeleccionados.length)
        ),
        createSummaryLine("Total", formatCurrency(total))
    );
}

function createSummaryLine(label, value) {
    const paragraph = document.createElement("p");

    const strong = document.createElement("strong");

    strong.textContent = `${label}: `;

    const text = document.createElement("span");

    text.textContent = value;

    paragraph.append(strong, text);

    return paragraph;
}

// ============================================
// CONTINUAR AL PAGO SIMULADO
// ============================================

function openPayment() {
    if (state.asientosSeleccionados.length === 0) {
        showMessage(
            elements.seatError,
            "Selecciona al menos un asiento."
        );

        return;
    }

    elements.paymentForm.reset();

    showMessage(elements.paymentError, "");

    updateBookingSummary();

    showView("pago");
}

// ============================================
// VALIDACIÓN DEL PAGO SIMULADO
// ============================================

function validatePayment() {
    const cardholder = elements.cardholder.value.trim();

    const cardNumber = elements.cardNumber.value.replace(/\s/g, "");

    const expiry = elements.cardExpiry.value.trim();

    const cvv = elements.cardCvv.value.trim();

    if (cardholder.length < 2) {
        return "Introduce el nombre del titular.";
    }

    if (!/^\d{13,19}$/.test(cardNumber)) {
        return "Introduce un número de tarjeta de prueba válido.";
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        return "La fecha debe tener el formato MM/AA.";
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        return "El CVV debe tener 3 o 4 dígitos.";
    }

    return null;
}

// ============================================
// CONFIRMAR RESERVA
// ============================================

async function handlePayment(event) {
    event.preventDefault();

    if (state.procesandoReserva) {
        return;
    }

    showMessage(elements.paymentError, "");

    const validationError = validatePayment();

    if (validationError) {
        showMessage(
            elements.paymentError,
            validationError
        );

        return;
    }

    if (
        !state.peliculaSeleccionada ||
        state.asientosSeleccionados.length === 0
    ) {
        showMessage(
            elements.paymentError,
            "La reserva no contiene una película o asientos."
        );

        return;
    }

    state.procesandoReserva = true;

    elements.confirmPaymentButton.disabled = true;
    elements.confirmPaymentButton.textContent =
        "Procesando reserva...";

    try {
        // El backend no procesa pagos.
        // Solo creamos la reserva mediante su API existente.

        const data = await apiRequest("/reservas", {
            method: "POST",
            body: JSON.stringify({
                peliculaId: state.peliculaSeleccionada.id,
                asientos: [...state.asientosSeleccionados]
            })
        });

        if (!data.reserva) {
            throw new Error(
                "El servidor no devolvió los datos de la reserva."
            );
        }

        state.reservaActual = data.reserva;

        renderTicket(data.reserva);

        // Vaciar el formulario para no conservar los datos de tarjeta.
        elements.paymentForm.reset();

        showView("ticket");

    } catch (error) {
        showMessage(
            elements.paymentError,
            error.message
        );

        // Si un asiento fue reservado por otro usuario,
        // actualizamos su disponibilidad en la interfaz.
        if (error.status === 409) {
            await loadSeats(state.peliculaSeleccionada.id);
        }

    } finally {
        state.procesandoReserva = false;

        elements.confirmPaymentButton.disabled = false;
        elements.confirmPaymentButton.textContent =
            "Confirmar compra";
    }
}

// ============================================
// BOLETO VIRTUAL
// ============================================

function renderTicket(reserva) {
    const pelicula = state.peliculas.find(
        (item) => item.id === reserva.peliculaId
    );

    elements.ticketId.textContent = reserva.id;

    elements.ticketMovie.textContent =
        pelicula?.titulo || reserva.peliculaId;

    elements.ticketSeats.textContent =
        reserva.asientos.join(", ");

    elements.ticketMessage.textContent =
        "Tu reserva se ha confirmado correctamente. El pago fue simulado.";
}

// ============================================
// VOLVER A LA CARTELERA
// ============================================

async function returnToMovies() {
    state.peliculaSeleccionada = null;
    state.asientos = [];
    state.asientosSeleccionados = [];
    state.reservaActual = null;

    elements.seatMap.replaceChildren();

    await loadMovies();

    showView("cartelera");
}

// ============================================
// CERRAR SESIÓN
// ============================================

function logout() {
    state.token = null;
    state.usuario = null;
    state.peliculaSeleccionada = null;
    state.asientos = [];
    state.asientosSeleccionados = [];
    state.reservaActual = null;

    state.peliculas = [];

    elements.loginForm.reset();
    elements.paymentForm.reset();

    elements.movieList.replaceChildren();
    elements.seatMap.replaceChildren();
    elements.bookingSummary.replaceChildren();

    showMessage(elements.loginError, "");
    showMessage(elements.moviesError, "");
    showMessage(elements.seatError, "");
    showMessage(elements.paymentError, "");

    // Reemplazar el historial evita volver a las vistas protegidas
    // mediante el botón Atrás del navegador.
    history.replaceState(
        { view: "login" },
        "",
        "#login"
    );

    showView("login", {
        updateHistory: false
    });
}

// ============================================
// MANEJO DEL HISTORIAL DEL NAVEGADOR
// ============================================

window.addEventListener("popstate", () => {
    if (!state.token) {
        history.replaceState(
            { view: "login" },
            "",
            "#login"
        );

        showView("login", {
            updateHistory: false
        });

        return;
    }

    // La navegación interna se controla desde los botones
    // para evitar mostrar pantallas en un estado inconsistente.
    history.pushState(
        { view: state.vistaActual },
        "",
        `#${state.vistaActual}`
    );

    showView(state.vistaActual, {
        updateHistory: false
    });
});

// ============================================
// UTILIDADES
// ============================================

function formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(amount);
}

// ============================================
// EVENTOS
// ============================================

elements.loginForm.addEventListener(
    "submit",
    handleLogin
);

elements.continueToPayment.addEventListener(
    "click",
    openPayment
);

elements.paymentForm.addEventListener(
    "submit",
    handlePayment
);

elements.backToCartelera.addEventListener(
    "click",
    returnToMovies
);

elements.logoutButton.addEventListener(
    "click",
    logout
);

// ============================================
// INICIALIZACIÓN
// ============================================

showView("login", {
    updateHistory: false
});

history.replaceState(
    { view: "login" },
    "",
    "#login"
);