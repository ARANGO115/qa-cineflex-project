const { By, until } = require('selenium-webdriver');

class CarteleraPage {
  constructor(driver) {
    this.driver = driver;
    this.section = By.id('cartelera-view');
    this.title = By.id('cartelera-title');
    this.movieCards = By.css('#movie-list .movie-card');
  }

  async isTitleVisible() {
    const elements = await this.driver.findElements(this.title);
    return elements.length > 0 && await elements[0].isDisplayed();
  }

  async getMovieCards() {
    return this.driver.findElements(this.movieCards);
  }

  async selectMovie(movieId) {
    const button = await this.driver.wait(until.elementLocated(
      By.css(`#movie-list button[data-movie-id="${movieId}"]`)
    ), 10000);
    await button.click();
  }

  async getMovieCount() {
    return (await this.getMovieCards()).length;
  }
}

module.exports = CarteleraPage;