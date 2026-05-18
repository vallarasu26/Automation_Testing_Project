const NAV_TIMEOUT = parseInt(process.env.NAV_TIMEOUT, 10) || 30000;

const log = (action, detail = '') => {
  const L = '─'.repeat(65);
  const d = detail ? `  →  ${detail}` : '';
  console.log(`\n${L}`);
  console.log(`  [CartPage]  ${action}${d}`);
  console.log(L);
};

class CartPage {
  constructor(page) {
    this.page = page;
    this.checkoutBtn = page.locator('[data-test="checkout"]');
    this.cartItems = page.locator('.cart_item');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async checkout() {
    try {
      log('▶ Click  Checkout button');
      await this.checkoutBtn.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const navPromise = this.page.waitForNavigation({ timeout: NAV_TIMEOUT }).catch(() => null);
      await Promise.all([this.checkoutBtn.click(), navPromise]);
      log('✔ Navigated  Checkout step 1 (Your Information)', this.page.url());
    } catch (error) {
      throw new Error(`Failed to click checkout button: ${error.message}`);
    }
  }

  async verifyCartItemCount(expectedCount) {
    try {
      await this.cartBadge.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const badgeText = await this.cartBadge.textContent();
      const actualCount = parseInt(badgeText, 10);
      log('ℹ Check  Cart badge count', `expected=${expectedCount}  actual=${actualCount}`);
      if (actualCount !== expectedCount) {
        throw new Error(`Expected ${expectedCount} items in cart badge, but found ${actualCount}`);
      }
    } catch (error) {
      throw new Error(`Cart item count verification failed: ${error.message}`);
    }
  }

  async openCartAndAssertItemCount(expectedCount = 1) {
    await this.checkout();
    await this.verifyCartItemCount(expectedCount);
  }

  async continueShopping() {
    try {
      log('▶ Click  Continue Shopping');
      const btn = this.page.locator('[data-test="continue-shopping"]');
      await btn.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const navPromise = this.page.waitForNavigation({ timeout: NAV_TIMEOUT }).catch(() => null);
      await Promise.all([btn.click(), navPromise]);
      log('✔ Navigated  Back to inventory', this.page.url());
    } catch (error) {
      throw new Error(`Failed to click Continue Shopping: ${error.message}`);
    }
  }

  async getItemCount() {
    try {
      const count = await this.cartItems.count();
      log('ℹ Read  Cart item count', String(count));
      return count;
    } catch (error) {
      throw new Error(`Unable to count cart items: ${error.message}`);
    }
  }

  async getItemNameAt(index = 0) {
    try {
      const nameEl = this.cartItems.nth(index).locator('.inventory_item_name');
      await nameEl.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const name = (await nameEl.textContent() || '').trim();
      log(`ℹ Read  Item name [${index}]`, `"${name}"`);
      return name;
    } catch (error) {
      throw new Error(`Unable to get cart item name at index ${index}: ${error.message}`);
    }
  }

  async getItemPriceAt(index = 0) {
    try {
      const priceEl = this.cartItems.nth(index).locator('.inventory_item_price');
      await priceEl.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const txt = await priceEl.textContent();
      const price = parseFloat((txt || '').replace(/[^0-9.]/g, ''));
      log(`ℹ Read  Item price [${index}]`, `$${price}`);
      return price;
    } catch (error) {
      throw new Error(`Unable to get cart item price at index ${index}: ${error.message}`);
    }
  }

  async isCartEmpty() {
    const count = await this.cartItems.count();
    const empty = count === 0;
    log('ℹ Check  Cart empty', empty ? 'Yes ✔' : `No  (${count} item(s) remain)`);
    return empty;
  }

  async removeItemAt(index = 0) {
    try {
      log(`▶ Click  Remove item [${index}]`);
      const removeBtn = this.cartItems.nth(index).locator('button[id^="remove-"]');
      await removeBtn.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await removeBtn.click();
      log('✔ Removed  Item from cart');
    } catch (error) {
      throw new Error(`Failed to remove item at index ${index}: ${error.message}`);
    }
  }
}

module.exports = CartPage;
