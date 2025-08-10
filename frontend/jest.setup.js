// Jest setup file for CryptoReels frontend tests

import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock environment variables
process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3003';
process.env.NAFFLES_FRONTEND_URL = 'http://localhost:3000';

// Global test utilities
global.testUtils = {
  mockApiResponse: (data, success = true) => ({
    ok: success,
    json: async () => ({ success, data, message: success ? 'Success' : 'Error' }),
  }),
  
  setupFetchMock: (responses) => {
    fetch.mockImplementation((url) => {
      const response = responses[url] || responses.default;
      return Promise.resolve(response);
    });
  }
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  fetch.mockClear();
});