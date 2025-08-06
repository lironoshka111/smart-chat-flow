// UI Test for Navigation Bug
// Test the flow: view chat -> System Access Request -> Feature Request -> System Access Request

describe('Navigation Bug Test', () => {
  beforeEach(() => {
    // Mock localStorage for chat history
    const mockHistory = [
      {
        id: '1',
        serviceId: 'system-access-request',
        serviceTitle: 'System Access Request',
        serviceDescription: 'Request system access',
        timestamp: new Date(),
        answers: {
          'first-name': 'John',
          'last-name': 'Doe',
          'email': 'john@example.com',
          'department': 'Engineering',
          'access-level': 'Admin',
          'reason': 'esfpodix;lk'
        },
        firstInput: 'John'
      }
    ];
    
    localStorage.setItem('chat-history-test@example.com', JSON.stringify(mockHistory));
  });

  it('should display chat messages when navigating between services and viewing history', () => {
    // 1. Start with System Access Request
    cy.visit('/');
    cy.get('[data-testid="service-system-access-request"]').click();
    
    // 2. View chat history
    cy.get('[data-testid="chat-history-item"]').first().click();
    
    // 3. Verify messages are displayed
    cy.get('[data-testid="chat-message"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="chat-answer"]').should('contain', 'John');
    cy.get('[data-testid="chat-answer"]').should('contain', 'Doe');
    cy.get('[data-testid="chat-answer"]').should('contain', 'esfpodix;lk');
    
    // 4. Switch to Feature Request
    cy.get('[data-testid="service-feature-request"]').click();
    
    // 5. Switch back to System Access Request
    cy.get('[data-testid="service-system-access-request"]').click();
    
    // 6. View the same chat history again
    cy.get('[data-testid="chat-history-item"]').first().click();
    
    // 7. Verify messages are still displayed correctly
    cy.get('[data-testid="chat-message"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="chat-answer"]').should('contain', 'John');
    cy.get('[data-testid="chat-answer"]').should('contain', 'Doe');
    cy.get('[data-testid="chat-answer"]').should('contain', 'esfpodix;lk');
  });
}); 