require('dotenv').config();
const { Before, After, BeforeStep, AfterStep } = require('@cucumber/cucumber');
const { chromium, firefox, request } = require('playwright');
const fs = require('fs');
const path = require('path');
const LoginPage = require('../../pages/loginPage');
const InventoryPage = require('../../pages/inventoryPage');
const CartPage = require('../../pages/cartPage');
const CheckoutPage = require('../../pages/checkoutPage');

// ─── API scenarios ────────────────────────────────────────────────────────────

Before({ tags: '@api' }, async function () {
  this.apiContext = await request.newContext({
    baseURL: 'https://simple-books-api.click',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  });
});

After({ tags: '@api' }, async function () {
  if (this.apiContext) await this.apiContext.dispose();
});

// ─── UI scenarios ─────────────────────────────────────────────────────────────

Before({ tags: 'not @api' }, async function () {
  const browserName = process.env.BROWSER || 'chromium';
  const headless = (process.env.HEADLESS || 'true').toLowerCase() !== 'false';

  const rawSlow = process.env.SLOWMO;
  let actionSlow = 0;
  let stepDelay = 0;
  if (rawSlow) {
    if (rawSlow === 'true') { actionSlow = 150; stepDelay = 150; }
    else {
      const v = parseInt(rawSlow, 10);
      if (!isNaN(v) && v > 0) { actionSlow = v; stepDelay = v; }
    }
  }

  const launchOptions = { headless };
  if (actionSlow) launchOptions.slowMo = actionSlow;
  if (browserName === 'chromium' && !headless) {
    launchOptions.args = ['--start-maximized'];
  }

  if (browserName === 'firefox') this.browser = await firefox.launch(launchOptions);
  else this.browser = await chromium.launch(launchOptions);

  const vw = parseInt(process.env.VIEWPORT_WIDTH, 10) || 1920;
  const vh = parseInt(process.env.VIEWPORT_HEIGHT, 10) || 1080;
  const contextOptions = {};
  if (headless) contextOptions.viewport = { width: vw, height: vh };
  else contextOptions.viewport = null;

  this.context = await this.browser.newContext(contextOptions);
  this.page = await this.context.newPage();
  if (!headless) {
    try { await this.page.bringToFront(); } catch (e) {}
  }

  this.NAV_TIMEOUT = parseInt(process.env.NAV_TIMEOUT, 10) || 30000;
  try { this.context.setDefaultNavigationTimeout(this.NAV_TIMEOUT); } catch (e) {}
  try { this.page.setDefaultNavigationTimeout(this.NAV_TIMEOUT); this.page.setDefaultTimeout(this.NAV_TIMEOUT); } catch (e) {}

  this.loginPage = new LoginPage(this.page);
  this.inventoryPage = new InventoryPage(this.page);
  this.cartPage = new CartPage(this.page);
  this.checkoutPage = new CheckoutPage(this.page);

  const stepDelayEnv = process.env.STEP_DELAY_MS ? parseInt(process.env.STEP_DELAY_MS, 10) : undefined;
  const finalStepDelay = (!isNaN(stepDelayEnv) && stepDelayEnv > 0) ? stepDelayEnv : stepDelay;
  this.__stepDelay = finalStepDelay;
});

BeforeStep(async function () {
  const s = this.__stepDelay || 0;
  if (s && this.page) await this.page.waitForTimeout(s);
});

AfterStep(async function () {
  const s = this.__stepDelay || 0;
  if (s && this.page) await this.page.waitForTimeout(s);
});

After({ tags: 'not @api' }, async function () {
  try {
    const shotsDir = path.join(process.cwd(), 'reports', 'screenshots');
    if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });
    const safeName = (this.pickle && this.pickle.name)
      ? this.pickle.name.replace(/[^a-z0-9-_]/gi, '_')
      : 'scenario';
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(shotsDir, `${safeName}_${ts}.png`);
    if (this.page) await this.page.screenshot({ path: file, fullPage: true });
  } catch (e) {}
  if (this.browser) await this.browser.close();
});
