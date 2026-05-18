@api
Feature: Simple Books API
  Comprehensive API tests for the Simple Books API covering authentication,
  book listing, order creation, retrieval, update, and deletion.

  Background:
    Given I have registered a new API client and received an access token
    And I have identified an available book for order tests

  # ── Public endpoints ────────────────────────────────────────────────────────

  @getStatus
  Scenario: GET /status - API health check
    When I send a GET request to "/status"
    Then the response status should be 200
    And the response body field "status" should equal "OK"

  @getBooks
  Scenario: GET /books - list all books returns an array
    When I send a GET request to "/books"
    Then the response status should be 200
    And the response body should be a non-empty array

  @getBooksByFiction
  Scenario: GET /books?type=fiction - filter books by fiction type
    When I send a GET request to "/books" with query param "type" equal to "fiction"
    Then the response status should be 200
    And every book in the response should have type "fiction"

  @getBooksByNonFiction
  Scenario: GET /books?type=non-fiction - filter books by non-fiction type
    When I send a GET request to "/books" with query param "type" equal to "non-fiction"
    Then the response status should be 200
    And every book in the response should have type "non-fiction"

  @getBooksWithLimit
  Scenario: GET /books?limit=3 - limit the number of books returned
    When I send a GET request to "/books" with query param "limit" equal to "3"
    Then the response status should be 200
    And the response should contain at most 3 items

  @getBookById
  Scenario: GET /books/:bookId - retrieve a single book
    When I send a GET request to "/books/1"
    Then the response status should be 200
    And the response body field "id" should equal 1
    And the response body should contain fields "name", "type", "available"

  # ── Authenticated endpoints ─────────────────────────────────────────────────

  @postOrder
  Scenario: POST /orders - place a new order with a bearer token
    When I place an order with customerName "Jane Doe"
    Then the response status should be 201
    And the response body should contain a non-empty "orderId"

  @getOrders
  Scenario: GET /orders - retrieve all orders requires authentication
    Given I have placed an order with customerName "Alice Johnson"
    When I send an authenticated GET request to "/orders"
    Then the response status should be 200
    And the response body should be a non-empty array

  @getOrderById
  Scenario: GET /orders/:orderId - retrieve a specific order by ID
    Given I have placed an order with customerName "Bob Williams"
    When I send an authenticated GET request to the current order
    Then the response status should be 200
    And the response body field "customerName" should equal "Bob Williams"
    And the response body field "bookId" should equal the available book id

  @patchOrder
  Scenario: PATCH /orders/:orderId - update an order's customer name
    Given I have placed an order with customerName "Charlie Davis"
    When I send a PATCH request to the current order with customerName "Charlie D Updated"
    Then the response status should be 204

  @deleteOrder
  Scenario: DELETE /orders/:orderId - delete an order and confirm it is gone
    Given I have placed an order with customerName "Diana Prince"
    When I send a DELETE request to the current order
    Then the response status should be 204
    And fetching the deleted order should return status 404
