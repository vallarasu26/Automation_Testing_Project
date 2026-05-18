# Simple Books API — Automated Tests
### Playwright Request API + Cucumber (JavaScript)

---

## What does this test?

This project **automatically tests the Simple Books API** — a public REST API that lets you browse books and place orders.

Unlike UI tests that open a browser, API tests talk directly to the **back-end service** by sending HTTP requests and checking the responses — no browser window involved.

> Think of it like checking whether a restaurant's kitchen is working correctly by calling them directly, rather than visiting in person.

---

## What is the Simple Books API?

The API is available at: **https://simple-books-api.click**

It is a simple demo API that allows you to:
1. Check if the service is online
2. Browse a list of books
3. Register yourself as a client to get an access token
4. Use that token to place, view, update, and delete orders

---

## How Authentication Works

Before you can place or manage orders, you must **register** and receive an **access token**.

```
Step 1 — Register your client
─────────────────────────────────────────────────────────────────
  You send:   POST /api-clients/
              { "clientName": "MyApp", "clientEmail": "you@test.com" }

  You receive: { "accessToken": "eyJhbGc..." }
─────────────────────────────────────────────────────────────────

Step 2 — Use the token on every protected request
─────────────────────────────────────────────────────────────────
  Authorization: Bearer eyJhbGc...
─────────────────────────────────────────────────────────────────
```

> Think of the access token like a wristband at an event — you register once at the door, get your wristband, and show it every time you want to enter a restricted area.

**Important:** Each email address can only be registered once. Our tests use a **unique email per run** (with a timestamp) so they never conflict.

---

## API Endpoints Covered

| Method | Endpoint | Auth required? | What it does |
|---|---|---|---|
| `GET` | `/status` | No | Check if the API is running |
| `GET` | `/books` | No | List all books |
| `GET` | `/books?type=fiction` | No | Filter books by type |
| `GET` | `/books?type=non-fiction` | No | Filter books by type |
| `GET` | `/books?limit=3` | No | Limit how many books come back |
| `GET` | `/books/:id` | No | Get details of one specific book |
| `POST` | `/api-clients/` | No | Register to get an access token |
| `POST` | `/orders` | **Yes** | Place a new book order |
| `GET` | `/orders` | **Yes** | View all your orders |
| `GET` | `/orders/:id` | **Yes** | View one specific order |
| `PATCH` | `/orders/:id` | **Yes** | Update an order's customer name |
| `DELETE` | `/orders/:id` | **Yes** | Delete an order |

---

## Test Scenarios

File: `features/api/simple_books_api.feature`

| Tag | Scenario | What it checks |
|---|---|---|
| `@getStatus` | GET /status — API health check | Status field equals "OK" |
| `@getBooks` | GET /books — list all books | Response is a non-empty array |
| `@getBooksByFiction` | GET /books?type=fiction | Every book returned has type "fiction" |
| `@getBooksByNonFiction` | GET /books?type=non-fiction | Every book returned has type "non-fiction" |
| `@getBooksWithLimit` | GET /books?limit=3 | No more than 3 books returned |
| `@getBookById` | GET /books/1 — single book | Book has id, name, type, available fields |
| `@postOrder` | POST /orders — place order with token | Response contains a new orderId |
| `@getOrders` | GET /orders — all orders | Returns a non-empty array |
| `@getOrderById` | GET /orders/:id — one order | Customer name and bookId match what was submitted |
| `@patchOrder` | PATCH /orders/:id — update name | Response status is 204 (no content = success) |
| `@deleteOrder` | DELETE /orders/:id + verify gone | Deleted order returns 404 when fetched again |

---

## Test Flow Diagram

Every scenario in this feature runs through this sequence:

```
┌────────────────────────────────────────────────────────────┐
│  BACKGROUND (runs before every scenario)                   │
│                                                            │
│  1. Register a new API client with a unique email          │
│     POST /api-clients/  →  receive accessToken            │
│                                                            │
│  2. Find the first available book                          │
│     GET /books  →  pick the first book where available=true│
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  SCENARIO STEPS                                            │
│                                                            │
│  For public endpoints (GET /status, GET /books):           │
│    → Send request, check status code and response body     │
│                                                            │
│  For authenticated endpoints (orders):                     │
│    → Send request with  Authorization: Bearer <token>      │
│    → Check status code and response data                   │
└────────────────────────────────────────────────────────────┘
```

---

## Running API Tests

### Run all API tests

```bash
npm run test:api
```

### Run a single scenario by tag

```bash
# Check the API is online
npx cucumber-js --tags @getStatus

# Test placing an order
npx cucumber-js --tags @postOrder

# Test updating an order
npx cucumber-js --tags @patchOrder

# Test deleting an order
npx cucumber-js --tags @deleteOrder

# Test the full order lifecycle (place → view → update → delete)
npx cucumber-js --tags "@postOrder or @getOrderById or @patchOrder or @deleteOrder"
```

---

## Console Log Output

Every API request and response is printed to the console in a structured block:

```
─────────────────────────────────────────────────────────────────
  ✔  POST  https://simple-books-api.click/api-clients/
     Status : 201 Created
     Body   : {
       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
─────────────────────────────────────────────────────────────────

     >> Selected bookId for tests: 1

─────────────────────────────────────────────────────────────────
  ✔  POST  https://simple-books-api.click/orders
     Status : 201 Created
     Body   : {
       "orderId": "PF6MflPDcuhWobZcgmJy5"
     }
─────────────────────────────────────────────────────────────────

     >> Stored orderId: PF6MflPDcuhWobZcgmJy5

─────────────────────────────────────────────────────────────────
  ✔  PATCH  https://simple-books-api.click/orders/PF6MflPDcuhWobZcgmJy5
     Status : 204 No Content
     Body   : (no content)
─────────────────────────────────────────────────────────────────

─────────────────────────────────────────────────────────────────
  ✔  DELETE  https://simple-books-api.click/orders/PF6MflPDcuhWobZcgmJy5
     Status : 204 No Content
     Body   : (no content)
─────────────────────────────────────────────────────────────────

─────────────────────────────────────────────────────────────────
  ✖  GET  https://simple-books-api.click/orders/PF6MflPDcuhWobZcgmJy5
     Status : 404 Not Found
     Body   : { "error": "No order with id PF6MflPDcuhWobZcgmJy5." }
─────────────────────────────────────────────────────────────────
```

| Symbol | Meaning |
|---|---|
| `✔` | Request succeeded (status < 400) |
| `✖` | Request returned an error status (≥ 400) |
| `>>` | Extra context logged between steps (e.g. which bookId or orderId was picked) |

---

## HTTP Status Codes — Plain English

| Code | Name | What it means in this project |
|---|---|---|
| `200` | OK | Request succeeded, data returned |
| `201` | Created | A new resource was created (e.g. order placed) |
| `204` | No Content | Action succeeded but nothing to return (e.g. update/delete) |
| `404` | Not Found | The order or book does not exist |
| `409` | Conflict | Email is already registered — our tests use unique emails to avoid this |

---

## How the Test Avoids the "Email Already Registered" Problem

The API returns a `409 Conflict` error if you try to register with an email that already exists.

Our test generates a **unique email on every run**:

```
playwright-1716012345678-4231@testmail.com
             ↑ timestamp       ↑ random number
```

This guarantees a fresh token every time without any manual cleanup.

---

## Project Files

| File | Purpose |
|---|---|
| `features/api/simple_books_api.feature` | All API test scenarios in plain English |
| `features/step_definitions/api_steps.js` | The code that runs each scenario step |
| `features/support/hooks.js` | Sets up the API request context before each `@api` scenario |
| `features/support/world.js` | Stores the token, bookId, orderId between steps |

---

## No Browser Required

API tests run **without opening any browser window**. The `@api` tag tells the framework to skip the browser setup entirely and use Playwright's lightweight HTTP client instead.

This makes API tests:
- **Faster** — no browser startup time
- **More stable** — no UI rendering issues
- **Easier to debug** — all data is visible in the console logs

---

> For UI (browser) test documentation, see [README.md](README.md)
