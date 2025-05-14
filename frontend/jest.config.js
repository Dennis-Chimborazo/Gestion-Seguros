// jest.config.js

module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios)/', // No ignores axios
  ],
  globals: {
    'babel-jest': {
      useESM: true,  // Opcional, pero generalmente innecesario si ya usas CommonJS
    },
  },
  testEnvironment: 'jsdom',
};
