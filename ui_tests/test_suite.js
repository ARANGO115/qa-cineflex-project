const assert = require('node:assert/strict');
const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('./pages/LoginPage');
const CarteleraPage = require('./pages/CarteleraPage');
const ReservaPage = require('./pages/ReservaPage');

const frontendUrl = process.env.UI_BASE_URL ||
  'http://127.0.0.1:5500/frontend/index.html';
const apiUrl = process.env.UI_API_URL || 'http://127.0.0.1:3000';
const demoEmail = process.env.DEMO_EMAIL || 'demo@cineflex.com';
const demoPassword = process.env.DEMO_PASSWORD || 'CineFlex2026!';
const timeout = 10000;

async function checkService(url, name, validateResponse) {
  let response;

  try {
    response = await fetch(url, { signal: AbortSignal.timeout(3000) });
  } catch (error) {
    throw new Error(
      `${name} no está disponible en ${url}. Inicia el servicio antes de ejecutar npm run test:ui.`,
      { cause: error }
    );
  }

  if (!response.ok || !await validateResponse(response)) {
    throw new Error(`${name} respondió de forma inesperada en ${url} (HTTP ${response.status}).`);
  }
}

async function waitForVisible(driver, selector) {
  const element = await driver.findElement(selector);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

async function loginSuccessfully(driver, loginPage) {
  await loginPage.enterCredentials(demoEmail, demoPassword);
  await loginPage.submit();
  await waitForVisible(driver, By.id('cartelera-view'));
}

async function chooseMovie(driver, loginPage, carteleraPage, movieId = 'peli-001') {
  await loginSuccessfully(driver, loginPage);
  await carteleraPage.selectMovie(movieId);
  await waitForVisible(driver, By.id('reserva-view'));
}

async function completePayment(driver, reservaPage, values = {
  cardholder: 'QA CineFlex',
  cardNumber: '4111111111111111',
  cardExpiry: '12/30',
  cardCvv: '123'
}) {
  await reservaPage.selectAvailableSeat();
  await reservaPage.continueToPayment();
  await waitForVisible(driver, By.id('pago-view'));

  await driver.findElement(By.id('cardholder')).sendKeys(values.cardholder);
  await driver.findElement(By.id('card-number')).sendKeys(values.cardNumber);
  await driver.findElement(By.id('card-expiry')).sendKeys(values.cardExpiry);
  await driver.findElement(By.id('card-cvv')).sendKeys(values.cardCvv);
  await reservaPage.confirmReservation();
}

describe('CineFlex - pruebas UI Selenium', function () {
  this.timeout(30000);

  let driver;
  let loginPage;
  let carteleraPage;
  let reservaPage;

  before(async function () {
    await checkService(
      frontendUrl,
      'Open Live Server',
      async (response) => (await response.text()).includes('id="login-view"')
    );
    await checkService(
      `${apiUrl}/api/peliculas`,
      'La API de CineFlex',
      async (response) => {
        if (!response.ok) return false;
        const data = await response.json();
        return Array.isArray(data.peliculas);
      }
    );

    driver = await new Builder()
      .forBrowser(process.env.SELENIUM_BROWSER || 'chrome')
      .build();
    await driver.manage().setTimeouts({ implicit: 0, pageLoad: timeout });
    loginPage = new LoginPage(driver);
    carteleraPage = new CarteleraPage(driver);
    reservaPage = new ReservaPage(driver);
  });

  beforeEach(async function () {
    await loginPage.open(frontendUrl);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('1. Abre la pantalla de inicio de sesión', async function () {
    assert.equal(await driver.getTitle(), 'CineFlex | Cine y reservas');
    assert.equal(await driver.findElement(By.id('login-title')).getText(), 'Bienvenido a CineFlex');
    assert.equal(await driver.findElement(By.id('login-view')).isDisplayed(), true);
  });

  it('2. Presenta un campo de correo requerido', async function () {
    assert.equal(await loginPage.isEmailAvailable(), true);
    const email = await driver.findElement(By.id('email'));
    assert.equal(await email.getAttribute('type'), 'email');
    assert.equal(await email.getAttribute('required'), 'true');
  });

  it('3. Presenta un campo de contraseña requerido y protegido', async function () {
    assert.equal(await loginPage.isPasswordAvailable(), true);
    const password = await driver.findElement(By.id('password'));
    assert.equal(await password.getAttribute('type'), 'password');
    assert.equal(await password.getAttribute('required'), 'true');
  });

  it('4. Muestra un error cuando las credenciales son incorrectas', async function () {
    await loginPage.enterCredentials(demoEmail, 'incorrecta');
    await loginPage.submit();

    assert.match(await loginPage.getErrorMessage(), /incorrectos/i);
    assert.equal(await driver.findElement(By.id('login-view')).isDisplayed(), true);
  });

  it('5. No envía el formulario si faltan credenciales obligatorias', async function () {
    await loginPage.submit();

    assert.equal(await driver.executeScript(
      'return document.getElementById("email").validity.valueMissing;'
    ), true);
    assert.equal(await driver.findElement(By.id('login-view')).isDisplayed(), true);
  });

  it('6. Permite iniciar sesión y abre la cartelera', async function () {
    await loginSuccessfully(driver, loginPage);

    assert.equal(await carteleraPage.isTitleVisible(), true);
    assert.equal(await driver.findElement(By.id('logout-button')).isDisplayed(), true);
  });

  it('7. Carga las películas disponibles en la cartelera', async function () {
    await loginSuccessfully(driver, loginPage);

    await driver.wait(async () => (await carteleraPage.getMovieCount()) > 0, timeout);
    assert.equal(await carteleraPage.getMovieCount(), 3);
  });

  it('8. Abre la reserva al seleccionar una película', async function () {
    await chooseMovie(driver, loginPage, carteleraPage);

    assert.equal(await driver.findElement(By.id('reserva-title')).getText(), 'Reserva tus asientos');
    assert.match(await driver.findElement(By.id('selected-movie')).getText(), /El viaje estelar/);
  });

  it('9. Muestra los asientos de la película seleccionada', async function () {
    await chooseMovie(driver, loginPage, carteleraPage);

    await driver.wait(async () => (await reservaPage.getSeatCount()) > 0, timeout);
    assert.equal(await reservaPage.getSeatCount(), 50);
    assert.ok((await reservaPage.getAvailableSeats()).length > 0);
  });

  it('10. Permite seleccionar un asiento disponible', async function () {
    await chooseMovie(driver, loginPage, carteleraPage);

    const seat = await reservaPage.selectAvailableSeat();
    assert.equal(await seat.getAttribute('aria-pressed'), 'true');
    assert.equal(await reservaPage.isContinueDisabled(), false);
  });

  it('11. Impide continuar al pago sin seleccionar asientos', async function () {
    await chooseMovie(driver, loginPage, carteleraPage);

    assert.equal(await reservaPage.isContinueDisabled(), true);
  });

  it('12. Rechaza los datos de pago inválidos y explica el primer error', async function () {
    await chooseMovie(driver, loginPage, carteleraPage);
    await completePayment(driver, reservaPage, {
      cardholder: 'A',
      cardNumber: '123',
      cardExpiry: '13/30',
      cardCvv: '1'
    });

    const error = await waitForVisible(driver, By.id('payment-error'));
    assert.match(await error.getText(), /nombre del titular/i);
    assert.equal(await driver.findElement(By.id('pago-view')).isDisplayed(), true);
  });

  it('13. Completa la compra y presenta el ticket virtual', async function () {
    await chooseMovie(driver, loginPage, carteleraPage);
    await completePayment(driver, reservaPage);

    await waitForVisible(driver, By.id('ticket-view'));
    assert.match(await driver.findElement(By.id('ticket-id')).getText(), /^[\da-f-]{36}$/i);
    assert.equal(await driver.findElement(By.id('ticket-movie')).getText(), 'El viaje estelar');
    assert.match(await driver.findElement(By.id('ticket-seats')).getText(), /^[A-E]\d{1,2}$/);
  });

  it('14. Permite regresar a la cartelera desde el ticket', async function () {
    await chooseMovie(driver, loginPage, carteleraPage);
    await completePayment(driver, reservaPage);
    await waitForVisible(driver, By.id('ticket-view'));

    await driver.findElement(By.id('back-to-cartelera')).click();
    await waitForVisible(driver, By.id('cartelera-view'));
    assert.equal(await carteleraPage.isTitleVisible(), true);
  });

  it('15. Cierra sesión y evita volver a una pantalla protegida con Atrás', async function () {
    await loginSuccessfully(driver, loginPage);

    await driver.findElement(By.id('logout-button')).click();
    await waitForVisible(driver, By.id('login-view'));
    await driver.navigate().back();
    await waitForVisible(driver, By.id('login-view'));

    assert.equal(await driver.findElement(By.id('cartelera-view')).isDisplayed(), false);
  });
});
