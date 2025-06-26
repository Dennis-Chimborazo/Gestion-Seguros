module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios)/',
  ],
  globals: {
    'babel-jest': {
      useESM: true,
    },
  },
  testEnvironment: 'jsdom',

  testPathIgnorePatterns: [
    "/node_modules/",
    ".*Fun\\.js$",
    "ApiService\\.js$",
    "App\\.test\\.js$",
  ],

  coveragePathIgnorePatterns: [
    "/node_modules/",
    ".*Fun\\.js$",
    "ApiService\\.js$",
    "App\\.test\\.js$",
  ],
};
