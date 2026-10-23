const { By, until } = require('selenium-webdriver');

class ReservaPage {
  constructor(driver) {
    this.driver = driver;
    this.seats = By.css('#seat-map .seat');
    this.availableSeats = By.css('#seat-map .seat.available:not(:disabled)');
    this.continueButton = By.id('continue-to-payment');
    this.confirmButton = By.id('confirm-payment-button');
    this.ticket = By.id('ticket-view');
  }

  async getAvailableSeats() {
    return this.driver.findElements(this.availableSeats);
  }

  async selectAvailableSeat() {
    const seat = await this.driver.wait(until.elementLocated(this.availableSeats), 10000);
    await seat.click();
    return seat;
  }

  async isContinueDisabled() {
    return this.driver.executeScript(
      'return document.getElementById("continue-to-payment").disabled;'
    );
  }

  async continueToPayment() {
    const button = await this.driver.wait(until.elementLocated(this.continueButton), 10000);
    await button.click();
  }

  async confirmReservation() {
    const button = await this.confirmButtonElement();
    await button.click();
  }

  async isTicketVisible() {
    const elements = await this.driver.findElements(this.ticket);
    return elements.length > 0 && await elements[0].isDisplayed();
  }

  async getSeatCount() {
    return (await this.driver.findElements(this.seats)).length;
  }

  async confirmButtonElement() {
    return this.driver.wait(until.elementLocated(this.confirmButton), 10000);
  }
}

module.exports = ReservaPage;