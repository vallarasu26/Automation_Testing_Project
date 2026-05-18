const NAV_TIMEOUT = parseInt(process.env.NAV_TIMEOUT, 10) || 30000;

const log = (action, detail = '') => {
  const L = '─'.repeat(65);
  const d = detail ? `  →  ${detail}` : '';
  console.log(`\n${L}`);
  console.log(`  [InventoryPage]  ${action}${d}`);
  console.log(L);
};

class InventoryPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('.title');
    this.items = page.locator('.inventory_item');
    this.addButtons = page.locator('button[id^="add-to-cart"]');
    this.cartBtn = page.locator('.shopping_cart_link');
  }

  async waitForLoad() {
    try {
      await this.title.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      log('✔ Loaded  Products page', this.page.url());
    } catch (error) {
      throw new Error(`Inventory page did not load correctly: ${error.message}`);
    }
  }

  async addFirstProductToCart() {
    try {
      const firstAddButton = this.addButtons.first();
      await firstAddButton.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      log('▶ Click  Add to Cart (first product)');
      await firstAddButton.click();
      log('✔ Added  First product to cart');
    } catch (error) {
      throw new Error(`Unable to add the first product to cart: ${error.message}`);
    }
  }

  async openCart() {
    try {
      log('▶ Click  Cart icon');
      await this.cartBtn.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const navPromise = this.page.waitForNavigation({ timeout: NAV_TIMEOUT }).catch(() => null);
      await Promise.all([this.cartBtn.click(), navPromise]);
      log('✔ Navigated  Cart page', this.page.url());
    } catch (error) {
      throw new Error(`Failed to open cart: ${error.message}`);
    }
  }

  async getFirstProductName() {
    try {
      const nameEl = this.page.locator('.inventory_item_name').first();
      await nameEl.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const name = (await nameEl.textContent() || '').trim();
      log('ℹ Read  First product name', `"${name}"`);
      return name;
    } catch (error) {
      throw new Error(`Unable to get first product name: ${error.message}`);
    }
  }

  async getFirstProductPrice() {
    try {
      const priceEl = this.page.locator('.inventory_item_price').first();
      await priceEl.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const txt = await priceEl.textContent();
      const price = parseFloat((txt || '').replace(/[^0-9.]/g, ''));
      log('ℹ Read  First product price', `$${price}`);
      return price;
    } catch (error) {
      throw new Error(`Unable to get first product price: ${error.message}`);
    }
  }

  async getCartBadgeCount() {
    try {
      const badge = this.page.locator('.shopping_cart_badge');
      const visible = await badge.isVisible();
      if (!visible) {
        log('ℹ Read  Cart badge count', '0  (badge not visible)');
        return 0;
      }
      const count = parseInt(await badge.textContent(), 10);
      log('ℹ Read  Cart badge count', String(count));
      return count;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = InventoryPage;
