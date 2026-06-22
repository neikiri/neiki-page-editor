/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  transform: {},
  // Map the CSS import used in the entry point to a stub that returns an empty string
  moduleNameMapper: {
    '\\.css$': '<rootDir>/test/__mocks__/cssMock.cjs',
  },
  testMatch: [
    '**/test/unit/**/*.test.js',
    '**/test/integration/**/*.test.js',
    '**/test/property/**/*.property.js',
  ],
  // Collect coverage from src/
  collectCoverageFrom: ['src/**/*.js'],
};

module.exports = config;
