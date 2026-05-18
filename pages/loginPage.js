const NAV_TIMEOUT = parseInt(process.env.NAV_TIMEOUT, 10) || 30000;

const log = (action, detail = '') => {
  const L = '─'.repeat(65);
  const d = detail ? `  →  ${detail}` : '';
  console.log(`\n${L}`);
  console.log(`  [LoginPage]  ${action}${d}`);
  console.log(L);
};

class LoginPage {
  constructor(page) {
    this.page = page;
    this.username = page.locator('#user-name');
    this.password = page.locator('#password');
    this.loginBtn = page.locator('#login-button');
    this.error = page.locator('[data-test="error"]');
  }

  async login(user, pass) {
    try {
      await this.enterUsername(user);
      await this.enterPassword(pass);
      await this.clickLogin();
    } catch (error) {
      throw new Error(`Login failed for user '${user}': ${error.message}`);
    }
  }

  async enterUsername(user) {
    try {
      log('▶ Fill  Username', `"${user}"`);
      await this.username.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await this.username.fill(user);
    } catch (error) {
      throw new Error(`Unable to enter username '${user}': ${error.message}`);
    }
  }

  async enterPassword(pass) {
    try {
      log('▶ Fill  Password', '"***"');
      await this.password.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await this.password.fill(pass);
    } catch (error) {
      throw new Error(`Unable to enter password: ${error.message}`);
    }
  }

  async clickLogin() {
    try {
      log('▶ Click  Login button');
      const navPromise = this.page.waitForNavigation({ timeout: NAV_TIMEOUT }).catch(() => null);
      await Promise.all([this.loginBtn.click(), navPromise]);
      log('✔ Navigated  after login', this.page.url());
    } catch (error) {
      throw new Error(`Login button click failed: ${error.message}`);
    }
  }

  async expectLockedOutError() {
    try {
      await this.error.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const txt = await this.error.textContent();
      if (!txt || !txt.toLowerCase().includes('locked out')) {
        throw new Error(`Unexpected error message: ${txt || 'none'}`);
      }
      log('✔ Assert  Locked out error', txt.trim());
    } catch (error) {
      throw new Error(`Locked out validation failed: ${error.message}`);
    }
  }

  async expectLoginError() {
    try {
      await this.error.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const txt = await this.error.textContent();
      log('✔ Assert  Login error visible', (txt || '').trim());
    } catch (error) {
      throw new Error(`Login error message was not displayed: ${error.message}`);
    }
  }

  async expectEmptyUsernameError() {
    try {
      await this.error.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const txt = await this.error.textContent();
      if (!txt || !txt.includes('Username is required')) {
        throw new Error(`Unexpected error message: "${txt || 'none'}"`);
      }
      log('✔ Assert  Empty username error', txt.trim());
    } catch (error) {
      throw new Error(`Empty username validation failed: ${error.message}`);
    }
  }

  async expectEmptyPasswordError() {
    try {
      await this.error.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const txt = await this.error.textContent();
      if (!txt || !txt.includes('Password is required')) {
        throw new Error(`Unexpected error message: "${txt || 'none'}"`);
      }
      log('✔ Assert  Empty password error', txt.trim());
    } catch (error) {
      throw new Error(`Empty password validation failed: ${error.message}`);
    }
  }

  async logout() {
    try {
      log('▶ Click  Burger menu');
      const menuBtn = this.page.locator('#react-burger-menu-btn');
      await menuBtn.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await menuBtn.click();
      log('▶ Click  Logout link');
      const logoutLink = this.page.locator('#logout_sidebar_link');
      await logoutLink.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      const navPromise = this.page.waitForNavigation({ timeout: NAV_TIMEOUT }).catch(() => null);
      await Promise.all([logoutLink.click(), navPromise]);
      log('✔ Navigated  Logged out', this.page.url());
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  async expectLoginPageVisible() {
    try {
      await this.loginBtn.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      log('✔ Assert  Login page visible', this.page.url());
    } catch (error) {
      throw new Error(`Login page not visible: ${error.message}`);
    }
  }
}

module.exports = LoginPage;
