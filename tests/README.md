# Smart Chat Flow - UI Tests

This directory contains UI tests for the Smart Chat Flow application.

## Test Structure

```
tests/
├── ui/
│   ├── navigation.test.js      # Navigation bug tests
│   ├── new-chat-button.test.js # New Chat button visibility tests
│   └── test-runner.js          # Test runner script
└── README.md                   # This file
```

## Test Cases

### 1. Navigation Bug Test

Tests the specific bug where:

- View chat history for "System Access Request - esfpodix;lk"
- Click on "Feature Request"
- Click back on "System Access Request - esfpodix;lk"
- Verify chat messages are still displayed correctly

### 2. New Chat Button Visibility Test

Tests that the "New Chat" button only appears when:

- Chat is active (started)
- Chat is not submitted
- Chat is not cancelled
- Not viewing chat history

### 3. Chat Message Display Test

Tests that chat messages display correctly in all scenarios.

## Running Tests

### Automatic Testing

Tests run automatically when the application loads. Open the browser console to see test results.

### Manual Testing

1. Start the development server: `npm run dev`
2. Open the application in your browser
3. Open browser console (F12)
4. Tests will run automatically and show results

## Test Results

The test runner provides:

- ✅ Pass/Fail status for each test
- 📊 Summary with success rate
- ❌ Detailed error messages for failed tests

## Adding New Tests

To add a new test:

1. Create a new test file in `tests/ui/`
2. Add the test function to `test-runner.js`
3. Add data-testid attributes to components being tested
4. Update this README with test description

## Test Data

Tests use mock data to simulate:

- Chat history
- User interactions
- Service switching
- Message display scenarios

## Browser Compatibility

Tests are designed to work in modern browsers with ES6+ support.
