const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const assert = require('assert');

setDefaultTimeout(30000);

// ─── Console logger ───────────────────────────────────────────────────────────

function logResponse(method, res, body) {
  const divider = '─'.repeat(65);
  const statusLabel = res.status() >= 400 ? '✖' : '✔';
  console.log(`\n${divider}`);
  console.log(`  ${statusLabel}  ${method.toUpperCase()}  ${res.url()}`);
  console.log(`     Status : ${res.status()} ${res.statusText()}`);
  console.log(`     Body   : ${body !== null ? JSON.stringify(body, null, 2) : '(no content)'}`);
  console.log(divider);
}

// ─── Background ───────────────────────────────────────────────────────────────

Given('I have registered a new API client and received an access token', async function () {
  const uniqueEmail = `playwright-${Date.now()}-${Math.floor(Math.random() * 9999)}@testmail.com`;

  const res = await this.apiContext.post('/api-clients/', {
    data: { clientName: 'PlaywrightTester', clientEmail: uniqueEmail },
  });
  const body = await res.json();
  logResponse('POST', res, body);

  assert.strictEqual(res.status(), 201,
    `Registration failed (${res.status()}): ${JSON.stringify(body)}`);
  assert.ok(body.accessToken, 'Expected accessToken in registration response');

  this.accessToken = body.accessToken;
});

Given('I have identified an available book for order tests', async function () {
  const res = await this.apiContext.get('/books');
  const books = await res.json();
  logResponse('GET', res, books);

  assert.strictEqual(res.status(), 200, 'Failed to fetch books list');

  const available = books.find((b) => b.available === true);
  assert.ok(available, 'No available books found in the catalogue');

  this.testBookId = available.id;
  console.log(`     >> Selected bookId for tests: ${this.testBookId}\n`);
});

// ─── Generic GET ─────────────────────────────────────────────────────────────

When('I send a GET request to {string}', async function (path) {
  this.lastResponse = await this.apiContext.get(path);
  this.lastResponseBody = await this.lastResponse.json().catch(() => null);
  logResponse('GET', this.lastResponse, this.lastResponseBody);
});

When('I send a GET request to {string} with query param {string} equal to {string}',
  async function (path, paramName, paramValue) {
    this.lastResponse = await this.apiContext.get(path, {
      params: { [paramName]: paramValue },
    });
    this.lastResponseBody = await this.lastResponse.json().catch(() => null);
    logResponse('GET', this.lastResponse, this.lastResponseBody);
  });

// ─── Authenticated GET ────────────────────────────────────────────────────────

When('I send an authenticated GET request to {string}', async function (path) {
  this.lastResponse = await this.apiContext.get(path, {
    headers: { Authorization: `Bearer ${this.accessToken}` },
  });
  this.lastResponseBody = await this.lastResponse.json().catch(() => null);
  logResponse('GET', this.lastResponse, this.lastResponseBody);
});

When('I send an authenticated GET request to the current order', async function () {
  this.lastResponse = await this.apiContext.get(`/orders/${this.currentOrderId}`, {
    headers: { Authorization: `Bearer ${this.accessToken}` },
  });
  this.lastResponseBody = await this.lastResponse.json().catch(() => null);
  logResponse('GET', this.lastResponse, this.lastResponseBody);
});

// ─── POST /orders ─────────────────────────────────────────────────────────────

When('I place an order with customerName {string}', async function (customerName) {
  this.lastResponse = await this.apiContext.post('/orders', {
    headers: { Authorization: `Bearer ${this.accessToken}` },
    data: { bookId: this.testBookId, customerName },
  });
  this.lastResponseBody = await this.lastResponse.json().catch(() => null);
  logResponse('POST', this.lastResponse, this.lastResponseBody);

  if (this.lastResponseBody && this.lastResponseBody.orderId) {
    this.currentOrderId = this.lastResponseBody.orderId;
  }
});

Given('I have placed an order with customerName {string}', async function (customerName) {
  const res = await this.apiContext.post('/orders', {
    headers: { Authorization: `Bearer ${this.accessToken}` },
    data: { bookId: this.testBookId, customerName },
  });
  const body = await res.json().catch(() => ({}));
  logResponse('POST', res, body);

  assert.strictEqual(res.status(), 201,
    `Order creation failed (${res.status()}): ${JSON.stringify(body)}`);
  assert.ok(body.orderId, 'Expected orderId in order creation response');

  this.currentOrderId = body.orderId;
  console.log(`     >> Stored orderId: ${this.currentOrderId}\n`);
});

// ─── PATCH /orders/:orderId ───────────────────────────────────────────────────

When('I send a PATCH request to the current order with customerName {string}',
  async function (newName) {
    this.lastResponse = await this.apiContext.patch(`/orders/${this.currentOrderId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      data: { customerName: newName },
    });
    this.lastResponseBody = null;
    logResponse('PATCH', this.lastResponse, this.lastResponseBody);
  });

// ─── DELETE /orders/:orderId ──────────────────────────────────────────────────

When('I send a DELETE request to the current order', async function () {
  this.deletedOrderId = this.currentOrderId;

  this.lastResponse = await this.apiContext.delete(`/orders/${this.currentOrderId}`, {
    headers: { Authorization: `Bearer ${this.accessToken}` },
  });
  this.lastResponseBody = null;
  logResponse('DELETE', this.lastResponse, this.lastResponseBody);
});

// ─── Assertions: status ───────────────────────────────────────────────────────

Then('the response status should be {int}', function (expectedStatus) {
  const actual = this.lastResponse.status();
  assert.strictEqual(actual, expectedStatus,
    `Expected HTTP ${expectedStatus} but received ${actual}.\nBody: ${JSON.stringify(this.lastResponseBody)}`);
});

// ─── Assertions: body shape ───────────────────────────────────────────────────

Then('the response body should be a non-empty array', function () {
  assert.ok(Array.isArray(this.lastResponseBody),
    `Expected an array but got: ${JSON.stringify(this.lastResponseBody)}`);
  assert.ok(this.lastResponseBody.length > 0, 'Expected a non-empty array');
});

Then('the response should contain at most {int} items', function (limit) {
  assert.ok(Array.isArray(this.lastResponseBody), 'Expected an array');
  assert.ok(
    this.lastResponseBody.length <= limit,
    `Expected ≤${limit} items but got ${this.lastResponseBody.length}`
  );
});

Then('the response body field {string} should equal {string}', function (field, expected) {
  assert.strictEqual(
    String(this.lastResponseBody[field]),
    expected,
    `Field "${field}": expected "${expected}" but got "${this.lastResponseBody[field]}"`
  );
});

Then('the response body field {string} should equal {int}', function (field, expected) {
  assert.strictEqual(
    this.lastResponseBody[field],
    expected,
    `Field "${field}": expected ${expected} but got ${this.lastResponseBody[field]}`
  );
});

Then('the response body field {string} should equal the available book id', function (field) {
  assert.strictEqual(
    this.lastResponseBody[field],
    this.testBookId,
    `Field "${field}": expected bookId ${this.testBookId} but got ${this.lastResponseBody[field]}`
  );
});

Then('the response body should contain a non-empty {string}', function (field) {
  const value = this.lastResponseBody[field];
  assert.ok(value !== undefined && value !== null && value !== '',
    `Expected non-empty field "${field}" but got: ${JSON.stringify(value)}`);
});

Then('the response body should contain fields {string}, {string}, {string}',
  function (f1, f2, f3) {
    for (const field of [f1, f2, f3]) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(this.lastResponseBody, field),
        `Expected field "${field}" to be present in response body`
      );
    }
  });

// ─── Assertions: book type filter ─────────────────────────────────────────────

Then('every book in the response should have type {string}', function (expectedType) {
  assert.ok(Array.isArray(this.lastResponseBody), 'Expected an array of books');

  this.lastResponseBody.forEach((book, i) => {
    assert.strictEqual(
      book.type,
      expectedType,
      `Book at index ${i} (id: ${book.id}) has type "${book.type}", expected "${expectedType}"`
    );
  });
});

// ─── Assertions: DELETE verification ─────────────────────────────────────────

Then('fetching the deleted order should return status 404', async function () {
  const res = await this.apiContext.get(`/orders/${this.deletedOrderId}`, {
    headers: { Authorization: `Bearer ${this.accessToken}` },
  });
  const body = await res.json().catch(() => null);
  logResponse('GET', res, body);

  assert.strictEqual(res.status(), 404,
    `Expected 404 for deleted order "${this.deletedOrderId}" but got ${res.status()}`);
});
