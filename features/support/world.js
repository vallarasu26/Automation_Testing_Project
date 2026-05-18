const { setWorldConstructor } = require('@cucumber/cucumber');

class CustomWorld {
  constructor() {
    // Browser (UI) test properties
    this.browser = null;
    this.context = null;
    this.page = null;
    this.loginPage = null;
    this.inventoryPage = null;
    this.cartPage = null;
    this.checkoutPage = null;
    this.NAV_TIMEOUT = parseInt(process.env.NAV_TIMEOUT, 10) || 30000;

    // UI test state shared between steps
    this.firstProductName = null;
    this.firstProductPrice = null;

    // API test properties
    this.apiContext = null;
    this.accessToken = null;
    this.testBookId = null;
    this.lastResponse = null;
    this.lastResponseBody = null;
    this.currentOrderId = null;
    this.deletedOrderId = null;
  }
}

setWorldConstructor(CustomWorld);
