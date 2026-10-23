const { By, until } = require('selenium-webdriver');

class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.loginView = By.id('login-view');
    this.emailInput = By.id('email');
    this.passwordInput = By.id('password');
    this.loginButton = By.id('login-button');
    this.loginError = By.id('login-error');
  }

  async open(url) {
    await this.driver.get(url);
    await this.driver.wait(
      until.elementIsVisible(await this.driver.findElement(this.loginView)),
      10000
    );
  }

  async isEmailAvailable() {
    const elements = await this.driver.findElements(this.emailInput);
    return elements.length > 0 && await elements[0].isDisplayed();
  }

  async isPasswordAvailable() {
    const elements = await this.driver.findElements(this.passwordInput);
    return elements.length > 0 && await elements[0].isDisplayed();
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

  async getErrorMessage() {
    const error = await this.driver.wait(until.elementIsVisible(
      await this.driver.findElement(this.loginError)
    ), 10000);
    return error.getText();
  }
}

module.exports = LoginPage;
