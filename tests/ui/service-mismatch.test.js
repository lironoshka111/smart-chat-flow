// Test for Service Mismatch Bug
// This tests the exact scenario shown in the screenshot where
// viewing "System Access Request" shows "Feature Request" messages

describe('Service Mismatch Bug Test', () => {
  beforeEach(() => {
    // Mock localStorage with the exact scenario from the screenshot
    const mockHistory = [
      {
        id: '1',
        serviceId: 'system-access-request',
        serviceTitle: 'System Access Request',
        serviceDescription: 'Request access to internal systems and applications',
        timestamp: new Date('2025-08-06T21:43:02'),
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

  it('should display correct service messages when viewing history', () => {
    // 1. Start with System Access Request
    cy.visit('/');
    cy.get('[data-testid="service-system-access-request"]').click();
    
    // 2. View the chat history
    cy.get('[data-testid="chat-history-item"]').first().click();
    
    // 3. Verify the header shows correct service
    cy.get('h1').should('contain', 'Viewing: System Access Request');
    
    // 4. Verify the messages are from System Access Request, not Feature Request
    cy.get('[data-testid="chat-message"]').should('not.contain', 'Feature Request');
    cy.get('[data-testid="chat-message"]').should('not.contain', 'feature request');
    cy.get('[data-testid="chat-message"]').should('not.contain', 'What would you like to name this feature');
    
    // 5. Verify System Access Request specific content is present
    cy.get('[data-testid="chat-answer"]').should('contain', 'esfpodix;lk');
    cy.get('[data-testid="chat-answer"]').should('contain', 'John');
    cy.get('[data-testid="chat-answer"]').should('contain', 'Doe');
  });

  it('should handle service switching correctly when viewing history', () => {
    // 1. Start with System Access Request and view history
    cy.visit('/');
    cy.get('[data-testid="service-system-access-request"]').click();
    cy.get('[data-testid="chat-history-item"]').first().click();
    
    // 2. Switch to Feature Request
    cy.get('[data-testid="service-feature-request"]').click();
    
    // 3. Verify we're no longer viewing history
    cy.get('h1').should('not.contain', 'Viewing:');
    
    // 4. Switch back to System Access Request
    cy.get('[data-testid="service-system-access-request"]').click();
    
    // 5. View the same history again
    cy.get('[data-testid="chat-history-item"]').first().click();
    
    // 6. Verify correct messages are displayed
    cy.get('h1').should('contain', 'Viewing: System Access Request');
    cy.get('[data-testid="chat-answer"]').should('contain', 'esfpodix;lk');
  });

  it('should not show wrong service messages when viewing history', () => {
    // 1. View System Access Request history
    cy.visit('/');
    cy.get('[data-testid="service-system-access-request"]').click();
    cy.get('[data-testid="chat-history-item"]').first().click();
    
    // 2. Verify no Feature Request messages are shown
    const featureRequestMessages = [
      'Welcome to the Feature Request system',
      'What would you like to name this feature',
      'Please describe the feature in detail',
      'What is the priority level for this feature',
      'When would you like this feature to be released',
      'Thank you for your feature request'
    ];
    
    featureRequestMessages.forEach(message => {
      cy.get('[data-testid="chat-message"]').should('not.contain', message);
    });
    
    // 3. Verify System Access Request messages are shown
    cy.get('[data-testid="chat-answer"]').should('contain', 'esfpodix;lk');
  });
}); 