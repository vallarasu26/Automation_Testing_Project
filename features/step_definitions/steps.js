const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(60000);

const executeStep = async (stepName, stepFn) => {
  try {
    return await stepFn();
  } catch (error) {
    console.error(`Step failed: ${stepName}`);
    console.error(error);
    throw new Error(`${stepName} failed: ${error.message}`);
  }
};

Given('I open the saucedemo login page', async function () {
  await executeStep('Open Sauce Demo login page', async () => {
    const url = 'https://www.saucedemo.com/';
    const L = '─'.repeat(65);
    console.log(`\n${L}`);
    console.log(`  [Navigate]  ▶ Open  →  ${url}`);
    console.log(L);
    await this.page.goto(url, { timeout: this.NAV_TIMEOUT });
    console.log(`\n${L}`);
    console.log(`  [Navigate]  ✔ Loaded  →  ${this.page.url()}`);
    console.log(L);
  });
});

When('I login with username {string} and password {string}', async function (username, password) {
  await executeStep('Login with credentials', async () => {
    await this.loginPage.login(username, password);
  });
});

When('the user enters the username {string}', async function (username) {
  await executeStep('Enter username', async () => {
    await this.loginPage.enterUsername(username);
  });
});

When('the user enters the password {string}', async function (password) {
  await executeStep('Enter password', async () => {
    await this.loginPage.enterPassword(password);
  });
});

When('the user clicks the login button', async function () {
  await executeStep('Click login button', async () => {
    await this.loginPage.clickLogin();
  });
});

Then('the user should see the inventory page', async function () {
  await executeStep('Verify inventory page loaded', async () => {
    await this.inventoryPage.waitForLoad();
  });
});

Then('I should see the inventory page', async function () {
  await executeStep('Verify inventory page loaded', async () => {
    await this.inventoryPage.waitForLoad();
  });
});

Then('I should see a locked out error', async function () {
  await executeStep('Verify locked out error', async () => {
    await this.loginPage.expectLockedOutError();
  });
});

Then('I should see a login error', async function () {
  await executeStep('Verify login error', async () => {
    await this.loginPage.expectLoginError();
  });
});

When('I add the first product to the cart', async function () {
  await executeStep('Add first product to cart', async () => {
    // Capture name & price before clicking so cart assertions can compare later
    this.firstProductName = await this.inventoryPage.getFirstProductName();
    this.firstProductPrice = await this.inventoryPage.getFirstProductPrice();
    await this.inventoryPage.addFirstProductToCart();
  });
});

When('I go to the cart', async function () {
  await executeStep('Navigate to cart', async () => {
    await this.inventoryPage.openCart();
  });
});

When('I checkout with firstname {string} lastname {string} postalcode {string}', async function (first, last, zip) {
  await executeStep('Checkout and complete details', async () => {
    await this.cartPage.checkout();
    await this.checkoutPage.fillDetailsAndFinish(first, last, zip);
  });
});

Then('I should see the order confirmation', async function () {
  await executeStep('Verify order confirmation', async () => {
    await this.checkoutPage.expectConfirmation();
  });
});

When('I proceed to checkout', async function () {
  await executeStep('Proceed to checkout', async () => {
    await this.cartPage.checkout();
  });
});

When('I fill checkout details with firstname {string} lastname {string} postalcode {string}', async function (first, last, zip) {
  await executeStep('Fill checkout details', async () => {
    await this.checkoutPage.fillDetailsAndFinish(first, last, zip);
  });
});

Then('the order summary total should be correct', async function () {
  await executeStep('Verify order summary total', async () => {
    await this.checkoutPage.verifyTotalMatches();
  });
});

When('I finish the order', async function () {
  await executeStep('Finish the order', async () => {
    await this.checkoutPage.finishOrder();
  });
});

// ── Login: empty-field errors ─────────────────────────────────────────────────

Then('I should see an empty username error', async function () {
  await executeStep('Verify empty username error', async () => {
    await this.loginPage.expectEmptyUsernameError();
  });
});

Then('I should see an empty password error', async function () {
  await executeStep('Verify empty password error', async () => {
    await this.loginPage.expectEmptyPasswordError();
  });
});

// ── Login: session management ─────────────────────────────────────────────────

Given('I am logged in as {string} with password {string}', async function (username, password) {
  await executeStep('Login as user', async () => {
    await this.loginPage.login(username, password);
    await this.inventoryPage.waitForLoad();
  });
});

When('I open the burger menu and log out', async function () {
  await executeStep('Open burger menu and log out', async () => {
    await this.loginPage.logout();
  });
});

Then('I should be on the login page', async function () {
  await executeStep('Verify login page is shown', async () => {
    await this.loginPage.expectLoginPageVisible();
  });
});

// ── Cart: badge & item assertions ─────────────────────────────────────────────

Then('the cart badge should show {int} item', async function (expected) {
  await executeStep('Verify cart badge count', async () => {
    const actual = await this.inventoryPage.getCartBadgeCount();
    if (actual !== expected) {
      throw new Error(`Cart badge: expected ${expected} but got ${actual}`);
    }
  });
});

Then('the cart item name should match the product I added', async function () {
  await executeStep('Verify cart item name matches inventory', async () => {
    const cartName = await this.cartPage.getItemNameAt(0);
    if (cartName !== this.firstProductName) {
      throw new Error(`Name mismatch: cart="${cartName}" inventory="${this.firstProductName}"`);
    }
  });
});

Then('the cart item price should match the product I added', async function () {
  await executeStep('Verify cart item price matches inventory', async () => {
    const cartPrice = await this.cartPage.getItemPriceAt(0);
    if (cartPrice !== this.firstProductPrice) {
      throw new Error(`Price mismatch: cart=${cartPrice} inventory=${this.firstProductPrice}`);
    }
  });
});

When('I remove the first item from the cart', async function () {
  await executeStep('Remove first item from cart', async () => {
    await this.cartPage.removeItemAt(0);
  });
});

Then('the cart should be empty', async function () {
  await executeStep('Verify cart is empty', async () => {
    const empty = await this.cartPage.isCartEmpty();
    if (!empty) throw new Error('Expected cart to be empty but it still contains items');
  });
});

When('I continue shopping from the cart', async function () {
  await executeStep('Continue shopping from cart', async () => {
    await this.cartPage.continueShopping();
  });
});

Then('I should be on the cart page', async function () {
  await executeStep('Verify cart page is shown', async () => {
    await this.page.waitForURL('**/cart.html', { timeout: this.NAV_TIMEOUT });
  });
});

// ── Checkout: cancel paths ────────────────────────────────────────────────────

When('I cancel the checkout', async function () {
  await executeStep('Cancel checkout at info step', async () => {
    await this.checkoutPage.cancelCheckout();
  });
});

When('I cancel the checkout overview', async function () {
  await executeStep('Cancel checkout at overview step', async () => {
    await this.checkoutPage.cancelOverview();
  });
});
