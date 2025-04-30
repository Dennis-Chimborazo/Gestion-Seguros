// jest.config.js

export default {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios)/', // Don't ignore axios
  ],
  globals: {
    'babel-jest': {
      useESM: true,  // Enable Babel to use ESM
    },
  },
};
