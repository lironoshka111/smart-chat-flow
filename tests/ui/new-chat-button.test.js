// UI Test for New Chat Button Visibility
// Test that New Chat button only shows when chat is active but not submitted

describe('New Chat Button Visibility Test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should not show New Chat button when chat is not started', () => {
    cy.get('[data-testid="service-employee-onboarding"]').click();
    
    // Button should not be visible when chat hasn't started
    cy.get('[data-testid="new-chat-button"]').should('not.exist');
  });

  it('should show New Chat button when chat is active but not submitted', () => {
    cy.get('[data-testid="service-employee-onboarding"]').click();
    
    // Start the chat
    cy.get('[data-testid="start-chat-button"]').click();
    
    // Button should be visible when chat is active
    cy.get('[data-testid="new-chat-button"]').should('be.visible');
    
    // Answer first question
    cy.get('[data-testid="chat-input"]').type('John');
    cy.get('[data-testid="submit-button"]').click();
    
    // Button should still be visible during active chat
    cy.get('[data-testid="new-chat-button"]').should('be.visible');
  });

  it('should hide New Chat button when chat is submitted', () => {
    cy.get('[data-testid="service-employee-onboarding"]').click();
    
    // Start the chat
    cy.get('[data-testid="start-chat-button"]').click();
    
    // Complete the chat flow
    cy.get('[data-testid="chat-input"]').type('John');
    cy.get('[data-testid="submit-button"]').click();
    
    cy.get('[data-testid="chat-input"]').type('Doe');
    cy.get('[data-testid="submit-button"]').click();
    
    cy.get('[data-testid="chat-input"]').type('john@example.com');
    cy.get('[data-testid="submit-button"]').click();
    
    // Continue through the flow...
    // When reaching the final submit action
    cy.get('[data-testid="action-button-submit"]').click();
    
    // Button should be hidden when chat is submitted
    cy.get('[data-testid="new-chat-button"]').should('not.exist');
  });

  it('should hide New Chat button when viewing chat history', () => {
    // Create a chat history first
    cy.get('[data-testid="service-employee-onboarding"]').click();
    cy.get('[data-testid="start-chat-button"]').click();
    
    // Complete a chat to create history
    cy.get('[data-testid="chat-input"]').type('John');
    cy.get('[data-testid="submit-button"]').click();
    // ... complete the flow
    
    // View chat history
    cy.get('[data-testid="chat-history-item"]').first().click();
    
    // Button should not be visible when viewing history
    cy.get('[data-testid="new-chat-button"]').should('not.exist');
  });
}); 