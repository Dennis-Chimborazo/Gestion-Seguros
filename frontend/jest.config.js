// jest.config.js
module.exports = {
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [], // permite transformar todo
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
  
  // ... tu configuración actual
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // para configuraciones adicionales
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // para manejar imports CSS
  }
};
