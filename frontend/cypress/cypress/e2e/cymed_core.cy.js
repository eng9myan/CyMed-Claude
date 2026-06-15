describe('CyMed Enterprise Core E2E', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080)
  })

  it('Successfully loads the unified HMS Dashboard', () => {
    cy.visit('/hms')
    cy.contains('CyMed EMR').should('be.visible')
    cy.contains('Clinical Operations').should('be.visible')
  })

  it('Navigates through critical ERP capabilities seamlessly', () => {
    cy.visit('/hms')

    // Test Point of Sale
    cy.contains('Hospital Billing / POS').click()
    cy.contains('Point of Sale').should('be.visible')
    cy.contains('Enterprise Register & Checkout Interface').should('be.visible')

    // Test Calendar
    cy.contains('Master Calendar').click()
    cy.contains('Enterprise Calendar').should('be.visible')

    // Test Messenger
    cy.contains('Messenger').click()
    cy.contains('CyMed Messenger').should('be.visible')

    // Test Fleet
    cy.contains('Fleet Management').click()
    cy.contains('Fleet Management').should('be.visible')

    // Test Marketing
    cy.contains('Email Campaigns').click()
    cy.contains('Email Campaigns').should('be.visible')

    // Test Coupons
    cy.contains('Coupons').click()
    cy.contains('Coupons & Discounts').should('be.visible')
  })

  it('Validates ER Triage Data Rendering', () => {
    cy.visit('/hms')
    cy.contains('ER Triage').click()
    cy.contains('TRAUMA LEVEL 1 ACTIVE').should('be.visible')
    cy.contains('Active Triage Board').should('be.visible')
  })
})
