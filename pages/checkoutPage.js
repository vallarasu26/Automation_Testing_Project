const NAV_TIMEOUT = parseInt(process.env.NAV_TIMEOUT, 10) || 30000;

const log = (action, detail = '') => {
  const L = '─'.repeat(65);
  const d = detail ? `  →  ${detail}` : '';
  console.log(`\n${L}`);
  console.log(`  [CheckoutPage]  ${action}${d}`);
  console.log(L);
};

class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.first = page.locator('[data-test="firstName"]');
    this.last = page.locator('[data-test="lastName"]');
    this.postal = page.locator('[data-test="postalCode"]');
    this.continueBtn = page.locator('[data-test="continue"]');
    this.finishBtn = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('.complete-header');
  }

  async fillDetailsAndFinish(first, last, zip) {
    try {
      log('▶ Fill  First Name', `"${first}"`);
      await this.first.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await this.first.fill(first);

      log('▶ Fill  Last Name', `"${last}"`);
      await this.last.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await this.last.fill(last);

      log('▶ Fill  Postal Code', `"${zip}"`);
      await this.postal.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await this.postal.fill(zip);

      log('▶ Click  Continue');
      const contNav = this.page.waitForNavigation({ timeout: NAV_TIMEOUT }).catch(() => null);
      await Promise.all([this.continueBtn.click(), contNav]);
      log('✔ Navigated  Checkout step 2 (Overview)', this.page.url());
    } catch (error) {
      throw new Error(`Checkout details submission failed: ${error.message}`);
    }
  }

  async expectConfirmation() {
    try {
      await this.completeHeader.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const txt = await this.completeHeader.textContent();
      log('✔ Assert  Order confirmed', (txt || '').trim());
    } catch (error) {
      throw new Error(`Order confirmation not displayed: ${error.message}`);
    }
  }

  async getSummaryPrices() {
    try {
      const subtotalText = await this.page.locator('.summary_subtotal_label').textContent();
      const taxText = await this.page.locator('.summary_tax_label').textContent();
      const totalText = await this.page.locator('.summary_total_label').textContent();
      const parse = (txt) => parseFloat((txt || '').replace(/[^0-9.]/g, '')) || 0;
      const result = {
        subtotal: parse(subtotalText),
        tax: parse(taxText),
        total: parse(totalText),
      };
      log('ℹ Read  Order summary prices',
        `subtotal=$${result.subtotal}  tax=$${result.tax}  total=$${result.total}`);
      return result;
    } catch (error) {
      throw new Error(`Unable to read order summary prices: ${error.message}`);
    }
  }

  async finishOrder() {
    try {
      log('▶ Click  Finish button');
      const finishNav = this.page.waitForNavigation({ timeout: NAV_TIMEOUT }).catch(() => null);
      await Promise.all([this.finishBtn.click(), finishNav]);
      log('✔ Navigated  Order complete page', this.page.url());
    } catch (error) {
      throw new Error(`Failed to finish order: ${error.message}`);
    }
  }

  async verifyTotalMatches() {
    const { subtotal, tax, total } = await this.getSummaryPrices();
    const computed = Math.round((subtotal + tax) * 100) / 100;
    const actual = Math.round(total * 100) / 100;
    log('ℹ Verify  Total calculation', `$${subtotal} + $${tax} = $${computed}  (displayed $${actual})`);
    if (computed !== actual) {
      throw new Error(`Total mismatch: subtotal+tax=${computed} but total=${actual}`);
    }
    log('✔ Assert  Total is correct');
  }

  async cancelCheckout() {
    try {
      log('▶ Click  Cancel  (step 1 — info page)');
      const cancelBtn = this.page.locator('[data-test="cancel"]');
      await cancelBtn.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const navPromise = this.page.waitForNavigation({ timeout: NAV_TIMEOUT }).catch(() => null);
      await Promise.all([cancelBtn.click(), navPromise]);
      log('✔ Navigated  After cancel step 1', this.page.url());
    } catch (error) {
      throw new Error(`Failed to cancel checkout: ${error.message}`);
    }
  }

  async cancelOverview() {
    try {
      log('▶ Click  Cancel  (step 2 — overview page)');
      const cancelBtn = this.page.locator('[data-test="cancel"]');
      await cancelBtn.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const navPromise = this.page.waitForNavigation({ timeout: NAV_TIMEOUT }).catch(() => null);
      await Promise.all([cancelBtn.click(), navPromise]);
      log('✔ Navigated  After cancel step 2', this.page.url());
    } catch (error) {
      throw new Error(`Failed to cancel checkout overview: ${error.message}`);
    }
  }
}

module.exports = CheckoutPage;
