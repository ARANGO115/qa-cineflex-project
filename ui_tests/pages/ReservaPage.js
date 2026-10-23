const { By, until } = require('selenium-webdriver');

class ReservaPage {
  constructor(driver) {
    this.driver = driver;
    this.seats = By.css('[data-seat-id], input[name="asiento"], .seat');
    this.availableSeats = By.css('[data-seat-id][data-available="true"], .seat.available, input[name="asiento"]:not([disabled])');
    this.confirmButton = By.css('[data-action="confirm"], button[type="submit"]');
    this.ticket = By.css('[data-testid="ticket"], [data-ticket], .ticket');
  }

  async getAvailableSeats() {
    return this.driver.findElements(this.availableSeats);
  }

  async selectAvailableSeat() {
    const seat = await this.driver.wait(until.elementLocated(this.availableSeats));
    await seat.click();
  }

  async continueWithoutRequiredPayment() {
    const button = await this.confirmButtonElement();
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

  async confirmButtonElement() {
    return this.driver.wait(until.elementLocated(this.confirmButton));
  }
}

module.exports = ReservaPage;