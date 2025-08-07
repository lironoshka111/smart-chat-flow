# Test Suite Documentation

This project uses **Vitest** for comprehensive testing with high-quality test coverage.

## Test Structure

### 📁 Test Organization

```
src/
├── test/
│   ├── setup.ts          # Global test setup and mocks
│   ├── test-utils.tsx    # Custom render utilities and providers
│   └── mocks/
│       └── chatService.ts # Mock data and service functions
├── components/
│   └── **/__tests__/     # Component tests
├── stores/
│   └── **/__tests__/     # Store/state management tests
├── services/
│   └── **/__tests__/     # API service tests
└── utils/
    └── **/__tests__/     # Utility function tests
```

## Test Categories

### 🧩 **Component Tests**

- **ChatSidebar**: Toggle functionality, search, service selection, history display
- **App**: Authentication routing and state management

### 🗄️ **Store Tests** (Zustand)

- **chatStore**: Service management, chat history, current chat state
- **userStore**: User authentication, preferences, logout functionality

### 🌐 **Service Tests**

- **chatService**: API calls, error handling, data fetching, concurrent requests

### 🔧 **Utility Tests**

- **chatValidation**: Input validation, pattern matching, message navigation

## Test Features

### ✅ **High-Quality Test Practices**

- **Comprehensive Coverage**: 80% coverage thresholds for branches, functions, lines, statements
- **Mocking Strategy**: Proper mocking of external dependencies (localStorage, fetch, React Query)
- **Error Scenarios**: Testing both success and failure paths
- **Edge Cases**: Boundary conditions, empty states, invalid inputs
- **Integration Testing**: Component behavior with real store interactions

### 🎯 **Testing Patterns**

- **AAA Pattern**: Arrange, Act, Assert structure
- **User-Centric**: Testing from user's perspective with @testing-library/user-event
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **Async Operations**: Proper handling of debounced inputs and API calls

## Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Coverage Goals

The test suite maintains high quality standards:

- **Branches**: 80%+
- **Functions**: 80%+
- **Lines**: 80%+
- **Statements**: 80%+

## Mock Strategy

### 🔄 **State Management Mocks**

- Zustand stores properly mocked with state reset between tests
- Persistence middleware mocked to avoid localStorage interference

### 🌐 **External Dependencies**

- `fetch` globally mocked for API testing
- `localStorage` mocked for consistent test environment
- React Query mocked to avoid network calls in component tests

### 📱 **Component Mocks**

- Child components mocked when testing parent component logic
- Focus on testing component behavior rather than implementation details

## Test Data

Mock data provides realistic test scenarios:

- **Services**: Multiple service types with various configurations
- **Chat History**: Complete conversation flows with timestamps
- **User Data**: Various user profiles and preference combinations
- **Validation**: Edge cases for all validation rules

This comprehensive test suite ensures reliability, maintainability, and confidence in code changes.
