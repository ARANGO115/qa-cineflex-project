const { Builder } = require('selenium-webdriver');
const LoginPage = require('./pages/LoginPage');
const CarteleraPage = require('./pages/CarteleraPage');
const ReservaPage = require('./pages/ReservaPage');

const integrationPending =
  'Pendiente: frontend/index.html está vacío; requiere entrega del frontend funcional.';

describe('CineFlex - pruebas UI Selenium', function () {
  this.timeout(15000);
  let driver;
  let loginPage;
  let carteleraPage;
  let reservaPage;

  before(async function () {
    driver = await new Builder().forBrowser(process.env.SELENIUM_BROWSER || 'chrome').build();
    loginPage = new LoginPage(driver);
    carteleraPage = new CarteleraPage(driver);
    reservaPage = new ReservaPage(driver);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it.skip('1. Abre la página de login', function () { throw new Error(integrationPending); });
  it.skip('2. Verifica que el campo de correo esté disponible', function () { throw new Error(integrationPending); });
  it.skip('3. Verifica que el campo de contraseña esté disponible', function () { throw new Error(integrationPending); });
  it.skip('4. Rechaza credenciales incorrectas', function () { throw new Error(integrationPending); });
  it.skip('5. Bloquea después de tres intentos fallidos', function () { throw new Error(integrationPending); });
  it.skip('6. Permite iniciar sesión correctamente', function () { throw new Error(integrationPending); });
  it.skip('7. Muestra el título Cartelera', function () { throw new Error(integrationPending); });
  it.skip('8. Muestra películas', function () { throw new Error(integrationPending); });
  it.skip('9. Permite seleccionar una película', function () { throw new Error(integrationPending); });
  it.skip('10. Muestra asientos disponibles', function () { throw new Error(integrationPending); });
  it.skip('11. Permite seleccionar un asiento libre', function () { throw new Error(integrationPending); });
  it.skip('12. Rechaza continuar sin datos obligatorios', function () { throw new Error(integrationPending); });
  it.skip('13. Rechaza datos de pago inválidos cuando exista el formulario', function () { throw new Error(integrationPending); });
  it.skip('14. Completa la compra y muestra el ticket virtual', function () { throw new Error(integrationPending); });
  it.skip('15. Cierra sesión y bloquea el regreso con Atrás', function () { throw new Error(integrationPending); });
});