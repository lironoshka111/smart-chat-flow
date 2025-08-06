// UI Tests for Edit Functionality
// Test the edit feature for chat messages

describe('Edit Functionality Tests', () => {
  beforeEach(() => {
    // Mock localStorage for chat history
    const mockHistory = [
      {
        id: '1',
        serviceId: 'employee-onboarding',
        serviceTitle: 'Employee Onboarding',
        answers: {
          'first-name': 'John',
          'last-name': 'Doe',
          'email': 'john@example.com'
        },
        firstInput: 'John'
      }
    ];
    
    localStorage.setItem('chat-history-test@example.com', JSON.stringify(mockHistory));
  });

  it('should show edit button on hover for input messages', () => {
    cy.visit('/');
    cy.get('[data-testid="service-employee-onboarding"]').click();
    cy.get('[data-testid="start-chat-button"]').click();
    
    // Answer first question
    cy.get('[data-testid="chat-input"]').type('John');
    cy.get('[data-testid="submit-button"]').click();
    
    // Answer second question
    cy.get('[data-testid="chat-input"]').type('Doe');
    cy.get('[data-testid="submit-button"]').click();
    
    // Hover over the answer to show edit button
    cy.get('[data-testid="chat-answer"]').first().trigger('mouseover');
    cy.get('[data-testid="edit-answer-button"]').should('be.visible');
  });

  it('should not show edit button when viewing chat history', () => {
    cy.visit('/');
    cy.get('[data-testid="service-employee-onboarding"]').click();
    
    // View chat history
    cy.get('[data-testid="chat-history-item"]').first().click();
    
    // Edit button should not be visible
    cy.get('[data-testid="edit-answer-button"]').should('not.exist');
  });

  it('should allow editing an answer', () => {
    cy.visit('/');
    cy.get('[data-testid="service-employee-onboarding"]').click();
    cy.get('[data-testid="start-chat-button"]').click();
    
    // Answer first question
    cy.get('[data-testid="chat-input"]').type('John');
    cy.get('[data-testid="submit-button"]').click();
    
    // Answer second question
    cy.get('[data-testid="chat-input"]').type('Doe');
    cy.get('[data-testid="submit-button"]').click();
    
    // Click edit button on first answer
    cy.get('[data-testid="chat-answer"]').first().trigger('mouseover');
    cy.get('[data-testid="edit-answer-button"]').click();
    
    // Should show edit input
    cy.get('[data-testid="chat-input"]').should('have.value', 'John');
    cy.get('[data-testid="chat-input"]').clear().type('Jane');
    cy.get('[data-testid="submit-button"]').click();
    
    // Should show updated answer
    cy.get('[data-testid="chat-answer"]').first().should('contain', 'Jane');
  });

  it('should show cancel button when editing', () => {
    cy.visit('/');
    cy.get('[data-testid="service-employee-onboarding"]').click();
    cy.get('[data-testid="start-chat-button"]').click();
    
    // Answer first question
    cy.get('[data-testid="chat-input"]').type('John');
    cy.get('[data-testid="submit-button"]').click();
    
    // Click edit button
    cy.get('[data-testid="chat-answer"]').first().trigger('mouseover');
    cy.get('[data-testid="edit-answer-button"]').click();
    
    // Should show cancel button
    cy.get('[data-testid="cancel-edit-button"]').should('be.visible');
  });

  it('should cancel editing when cancel button is clicked', () => {
    cy.visit('/');
    cy.get('[data-testid="service-employee-onboarding"]').click();
    cy.get('[data-testid="start-chat-button"]').click();
    
    // Answer first question
    cy.get('[data-testid="chat-input"]').type('John');
    cy.get('[data-testid="submit-button"]').click();
    
    // Click edit button
    cy.get('[data-testid="chat-answer"]').first().trigger('mouseover');
    cy.get('[data-testid="edit-answer-button"]').click();
    
    // Click cancel
    cy.get('[data-testid="cancel-edit-button"]').click();
    
    // Should not show edit input anymore
    cy.get('[data-testid="cancel-edit-button"]').should('not.exist');
  });

  it('should validate edited input', () => {
    cy.visit('/');
    cy.get('[data-testid="service-employee-onboarding"]').click();
    cy.get('[data-testid="start-chat-button"]').click();
    
    // Answer first question
    cy.get('[data-testid="chat-input"]').type('John');
    cy.get('[data-testid="submit-button"]').click();
    
    // Click edit button
    cy.get('[data-testid="chat-answer"]').first().trigger('mouseover');
    cy.get('[data-testid="edit-answer-button"]').click();
    
    // Try to submit empty value
    cy.get('[data-testid="chat-input"]').clear();
    cy.get('[data-testid="submit-button"]').click();
    
    // Should show validation error
    cy.get('.text-red-600').should('contain', 'required');
  });

  it('should edit action messages', () => {
    cy.visit('/');
    cy.get('[data-testid="service-employee-onboarding"]').click();
    cy.get('[data-testid="start-chat-button"]').click();
    
    // Complete the chat flow to reach an action
    cy.get('[data-testid="chat-input"]').type('John');
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="chat-input"]').type('Doe');
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="chat-input"]').type('john@example.com');
    cy.get('[data-testid="submit-button"]').click();
    
    // Continue through the flow to reach an action message
    // This depends on the specific chat flow structure
    
    // Hover over action answer to show edit button
    cy.get('[data-testid="chat-answer"]').last().trigger('mouseover');
    cy.get('[data-testid="edit-action-button"]').should('be.visible');
  });

  it('should maintain edit state when switching between messages', () => {
    cy.visit('/');
    cy.get('[data-testid="service-employee-onboarding"]').click();
    cy.get('[data-testid="start-chat-button"]').click();
    
    // Answer first question
    cy.get('[data-testid="chat-input"]').type('John');
    cy.get('[data-testid="submit-button"]').click();
    
    // Answer second question
    cy.get('[data-testid="chat-input"]').type('Doe');
    cy.get('[data-testid="submit-button"]').click();
    
    // Start editing first answer
    cy.get('[data-testid="chat-answer"]').first().trigger('mouseover');
    cy.get('[data-testid="edit-answer-button"]').click();
    
    // Should be in edit mode
    cy.get('[data-testid="cancel-edit-button"]').should('be.visible');
    
    // Answer third question (should exit edit mode)
    cy.get('[data-testid="chat-input"]').type('john@example.com');
    cy.get('[data-testid="submit-button"]').click();
    
    // Should not be in edit mode anymore
    cy.get('[data-testid="cancel-edit-button"]').should('not.exist');
  });
}); 