Feature: Login Functionality
  All SauceDemo login scenarios: valid users, locked out user,
  invalid credentials, empty fields, and session logout.

  Background:
    Given I open the saucedemo login page

  # ── Valid logins ─────────────────────────────────────────────────────────────

  @validLogin @smoke
  Scenario: Standard user logs in successfully
    When I login with username "standard_user" and password "secret_sauce"
    Then I should see the inventory page

  @validLogin
  Scenario: Performance glitch user logs in successfully
    When I login with username "performance_glitch_user" and password "secret_sauce"
    Then I should see the inventory page

  @validLogin
  Scenario: Problem user logs in successfully
    When I login with username "problem_user" and password "secret_sauce"
    Then I should see the inventory page

  @validLogin
  Scenario: Visual user logs in successfully
    When I login with username "visual_user" and password "secret_sauce"
    Then I should see the inventory page

  @validLogin
  Scenario: Error user logs in successfully
    When I login with username "error_user" and password "secret_sauce"
    Then I should see the inventory page

  # ── Locked out user ──────────────────────────────────────────────────────────

  @lockedOutLogin
  Scenario: Locked out user is denied access
    When I login with username "locked_out_user" and password "secret_sauce"
    Then I should see a locked out error

  # ── Invalid credentials ──────────────────────────────────────────────────────

  @invalidLogin
  Scenario: Wrong password shows credential error
    When I login with username "standard_user" and password "wrong_password"
    Then I should see a login error

  @invalidLogin
  Scenario: Unknown username shows credential error
    When I login with username "unknown_user" and password "secret_sauce"
    Then I should see a login error

  # ── Empty fields ─────────────────────────────────────────────────────────────

  @emptyFields
  Scenario: Empty username shows required field error
    When the user enters the password "secret_sauce"
    And the user clicks the login button
    Then I should see an empty username error

  @emptyFields
  Scenario: Empty password shows required field error
    When the user enters the username "standard_user"
    And the user clicks the login button
    Then I should see an empty password error

  @emptyFields
  Scenario: Both fields empty shows username required error
    When the user clicks the login button
    Then I should see an empty username error

  # ── Step-by-step explicit actions ────────────────────────────────────────────

  @stepByStep @validLogin
  Scenario: Step-by-step valid login flow
    When the user enters the username "standard_user"
    And the user enters the password "secret_sauce"
    And the user clicks the login button
    Then the user should see the inventory page

  @stepByStep @lockedOutLogin
  Scenario: Step-by-step locked out login flow
    When the user enters the username "locked_out_user"
    And the user enters the password "secret_sauce"
    And the user clicks the login button
    Then I should see a locked out error

  @stepByStep @invalidLogin
  Scenario: Step-by-step invalid login flow
    When the user enters the username "standard_user"
    And the user enters the password "wrong_pass"
    And the user clicks the login button
    Then I should see a login error

  # ── Logout ───────────────────────────────────────────────────────────────────

  @logout
  Scenario: Logged-in user can log out and is redirected to login page
    Given I am logged in as "standard_user" with password "secret_sauce"
    When I open the burger menu and log out
    Then I should be on the login page
