// Jest setup file for CryptoReels backend tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3004'; // Different port for testing
process.env.NAFFLES_API_URL = 'http://localhost:3000';

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Global test utilities
global.testUtils = {
  createMockRequest: (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query,
    headers: {},
    user: null
  }),
  
  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  }
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});