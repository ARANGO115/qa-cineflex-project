const { By, until } = require('selenium-webdriver');

class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.emailInput = By.css('input[type="email"]');
    this.passwordInput = By.css('input[type="password"]');
    this.loginButton = By.css('button[type="submit"], input[type="submit"]');
  }

  async open(url) {
    await this.driver.get(url);
  }

  async isEmailAvailable() {
    return (await this.driver.findElements(this.emailInput)).length > 0;
  }

  async isPasswordAvailable() {
    return (await this.driver.findElements(this.passwordInput)).length > 0;
  }

  async enterCredentials(email, password) {
    const emailElement = await this.driver.wait(until.elementLocated(this.emailInput));
    const passwordElement = await this.driver.wait(until.elementLocated(this.passwordInput));
    await emailElement.clear();
    await emailElement.sendKeys(email);
    await passwordElement.clear();
    await passwordElement.sendKeys(password);
  }

  async submit() {
    const button = await this.driver.wait(until.elementLocated(this.loginButton));
    await button.click();
  }
}

module.exports = LoginPage;