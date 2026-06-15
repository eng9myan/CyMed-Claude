describe('CyMed Enterprise Authentication Flow', () => {
  it('should redirect unauthenticated users to login', () => {
    cy.visit('http://localhost:3000/')
    cy.url().should('include', '/login')
  })

  it('should login an admin successfully and redirect to Command Center', () => {
    cy.visit('http://localhost:3000/login')
    
    // Type credentials
    cy.get('input[type="email"]').type('admin@cymed.com')
    cy.get('input[type="password"]').type('password123')
    
    // Click Sign In
    cy.contains('button', 'Sign In').click()
    
    // Should be redirected to workspace default (e.g. portal or command center)
    cy.url().should('include', '/portal')
    
    // Navigate to Command Center
    cy.contains('a', 'Command Center').click()
    cy.url().should('include', '/command_center')
    
    // Verify Dashboard loads real metrics
    cy.contains('Hospital Command Center').should('be.visible')
    cy.contains('Patient Volume').should('be.visible')
  })

  it('should enforce Role-Based Access Control (RBAC) hiding Command Center for Doctors', () => {
    cy.visit('http://localhost:3000/login')
    
    cy.get('input[type="email"]').type('doctor@cymed.com')
    cy.get('input[type="password"]').type('password123')
    cy.contains('button', 'Sign In').click()
    
    cy.url().should('include', '/portal')
    
    // Command Center should NOT exist in the sidebar for doctors
    cy.contains('Command Center').should('not.exist')
    
    // But Patients should exist
    cy.contains('a', 'Patients').should('be.visible')
  })
})
