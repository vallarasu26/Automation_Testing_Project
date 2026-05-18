
@Regression
Feature: Product Ordering
  Full e2e order flows: add to cart, cart management, checkout steps,
  order completion, and cancellation paths.

  Background:
    Given I open the saucedemo login page
    And I login with username "standard_user" and password "secret_sauce"

  # ── Cart management ──────────────────────────────────────────────────────────

  @addToCart @smoke
  Scenario: Adding a product updates the cart badge to 1
    When I add the first product to the cart
    Then the cart badge should show 1 item

  @cartItemDetails
  Scenario: Cart shows the correct item name and price from the inventory
    When I add the first product to the cart
    And I go to the cart
    Then the cart item name should match the product I added
    And the cart item price should match the product I added

  @removeFromCart
  Scenario: Removing the only item from the cart empties the cart
    When I add the first product to the cart
    And I go to the cart
    And I remove the first item from the cart
    Then the cart should be empty

  @continueShopping
  Scenario: Clicking Continue Shopping from cart returns to inventory
    When I add the first product to the cart
    And I go to the cart
    And I continue shopping from the cart
    Then I should see the inventory page

  # ── Checkout flow ────────────────────────────────────────────────────────────

  @E2E @smoke
  Scenario: Complete order flow with price verification
    When I add the first product to the cart
    And I go to the cart
    And I proceed to checkout
    And I fill checkout details with firstname "John" lastname "Doe" postalcode "12345"
    Then the order summary total should be correct
    And I finish the order
    Then I should see the order confirmation

  @cancelCheckoutStep1
  Scenario: Cancelling on the checkout info page returns to cart
    When I add the first product to the cart
    And I go to the cart
    And I proceed to checkout
    And I cancel the checkout
    Then I should be on the cart page

  @cancelCheckoutStep2
  Scenario: Cancelling on the checkout overview page returns to inventory
    When I add the first product to the cart
    And I go to the cart
    And I proceed to checkout
    And I fill checkout details with firstname "Jane" lastname "Smith" postalcode "67890"
    And I cancel the checkout overview
    Then I should see the inventory page
