const { By, until } = require('selenium-webdriver');

class CarteleraPage {
  constructor(driver) {
    this.driver = driver;
    this.section = By.css('main, [data-section="cartelera"], section');
    this.title = By.xpath("//*[normalize-space()='Cartelera']");
    this.movieCards = By.css('[data-movie-id], article, .movie-card, .pelicula-card');
    this.buyButton = By.css('[data-action="buy"], button');
  }

  async isTitleVisible() {
    const elements = await this.driver.findElements(this.title);
    return elements.length > 0 && await elements[0].isDisplayed();
  }

  async getMovieCards() {
    return this.driver.findElements(this.movieCards);
  }

  async selectMovie(movieId) {
    const movie = await this.driver.findElement(By.css(`[data-movie-id="${movieId}"]`));
    await movie.click();
  }

  async clickBuy() {
    const button = await this.driver.wait(until.elementLocated(this.buyButton));
    await button.click();
  }
}

module.exports = CarteleraPage;