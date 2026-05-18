# Automation Testing Project

A BDD automation framework using **Cucumber.js** and **Playwright** that covers UI testing on the SauceDemo e-commerce site and API testing against the Simple Books API.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Architecture](#architecture)
- [Reporting](#reporting)

---

## Project Overview

| Area | Target | Description |
|------|--------|-------------|
| UI | https://www.saucedemo.com | Login flows, cart management, checkout end-to-end |
| API | https://simple-books-api.click | REST API — auth, books, orders (CRUD) |

---

## Folder Structure

```
Automation_Testing_Project/
├── features/
│   ├── api/
│   │   └── simple_books_api.feature    # API test scenarios
│   ├── login.feature                   # Login/logout UI scenarios
│   ├── order.feature                   # Cart and checkout UI scenarios
│   ├── step_definitions/
│   │   ├── api_steps.js                # Step definitions for API tests
│   │   └── steps.js                    # Step definitions for UI tests
│   └── support/
│       ├── hooks.js                    # Before/After hooks (browser & API setup)
│       └── world.js                    # Shared state across steps
├── pages/                              # Page Object Models
│   ├── loginPage.js
│   ├── inventoryPage.js
│   ├── cartPage.js
│   └── checkoutPage.js
├── report/
│   └── generate-report.js             # HTML report generator
├── cucumber.js                        # Cucumber configuration
├── package.json
└── README-API.md                      # Detailed API test documentation
```

---

## Prerequisites

- Node.js 16+
- npm 8+

---

## Installation

```bash
npm install
npx playwright install
```

---

## Configuration

Set these via a `.env` file or shell environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `BROWSER` | `chromium` | `chromium` or `firefox` |
| `HEADLESS` | `true` | Run browser headlessly |
| `SLOWMO` | — | Slow-motion delay in ms (`true` = 150ms) |
| `STEP_DELAY_MS` | — | Pause between each step (ms) |
| `VIEWPORT_WIDTH` | `1920` | Browser viewport width |
| `VIEWPORT_HEIGHT` | `1080` | Browser viewport height |
| `NAV_TIMEOUT` | `30000` | Navigation/element wait timeout (ms) |

---

## Running Tests

```bash
# All tests (Chrome, 2 parallel workers)
npm test

# Chrome only
npm run test:chrome

# Firefox only
npm run test:firefox

# Chrome + Firefox simultaneously
npm run test:parallel

# API tests only
npm run test:api

# UI tests only
npm run test:ui

# Run by specific tag
npx cucumber-js --tags @smoke
npx cucumber-js --tags "@postOrder or @patchOrder"

# Headed mode with slow motion (for debugging)
HEADLESS=false SLOWMO=true npm test

# Generate HTML report after test run
npm run report
```

---

## Test Coverage

### UI Tests — SauceDemo

**Test Users** (password: `secret_sauce` for all):

| Username | Behavior |
|----------|----------|
| `standard_user` | Normal flow |
| `performance_glitch_user` | Slow responses |
| `problem_user` | UI issues |
| `visual_user` | Visual bugs |
| `error_user` | API errors |
| `locked_out_user` | Login blocked |

**Feature: Login** (`login.feature`)

| Tag | Scenario |
|-----|----------|
| `@validLogin` | Successful login for each valid user |
| `@invalidLogin` | Wrong password shows error |
| `@lockedOutLogin` | Locked user cannot log in |
| `@emptyFields` | Empty username/password validation |
| `@logout` | Logout from burger menu |

**Feature: Order** (`order.feature`)

| Tag | Scenario |
|-----|----------|
| `@addToCart` | Add first product to cart |
| `@cartItemDetails` | Verify product name and price in cart |
| `@removeFromCart` | Remove item from cart |
| `@continueShopping` | Continue shopping from cart page |
| `@E2E` | Full checkout end-to-end |
| `@cancelCheckoutStep1` | Cancel at shipping info page |
| `@cancelCheckoutStep2` | Cancel at order overview page |

---

### API Tests — Simple Books API

See [README-API.md](README-API.md) for full endpoint reference.

| Tag | Method | Endpoint | Description |
|-----|--------|----------|-------------|
| `@getStatus` | GET | /status | Health check |
| `@getBooks` | GET | /books | List all books |
| `@getBooksByFiction` | GET | /books?type=fiction | Filter by type |
| `@getBooksByNonFiction` | GET | /books?type=non-fiction | Filter by type |
| `@getBooksWithLimit` | GET | /books?limit=N | Limit results |
| `@getBookById` | GET | /books/:id | Single book details |
| `@postOrder` | POST | /orders | Place an order |
| `@getOrders` | GET | /orders | List all orders |
| `@getOrderById` | GET | /orders/:id | Single order details |
| `@patchOrder` | PATCH | /orders/:id | Update order |
| `@deleteOrder` | DELETE | /orders/:id | Delete order |

Each API test run auto-registers a unique client and receives a fresh Bearer token — no manual setup needed.

---

## Architecture

### Page Object Model (POM)

Each page class encapsulates selectors and user actions:

- **LoginPage** — Username/password entry, login button, error messages, logout
- **InventoryPage** — Product list, add-to-cart, cart badge, product details
- **CartPage** — Item list, remove item, checkout button, continue shopping
- **CheckoutPage** — Shipping info form, order overview, finish/cancel

### Shared World (`world.js`)

`CustomWorld` holds all cross-step state:

- `page`, `context`, `browser` — Playwright browser objects
- `apiContext` — Playwright request context for API tests
- `accessToken`, `testBookId`, `currentOrderId`, `lastResponse` — API state
- `firstProductName`, `firstProductPrice` — UI cart verification data

### Hooks (`hooks.js`)

| Hook | Applies to | Action |
|------|-----------|--------|
| Before | `@api` | Create API request context |
| Before | `not @api` | Launch browser, instantiate page objects |
| After | All | Close browser, screenshot on failure |
| BeforeStep/AfterStep | All | Optional step delay for debugging |

---

## Reporting

After a test run, generate an HTML report:

```bash
npm run report
```

Reports are saved to `reports/`. Screenshots on failure are saved to `reports/screenshots/`.

