export default {
    testEnvironment: 'node',
    collectCoverage: true,
    coverageReporters: ['text', 'lcov'],
    coverageDirectory: 'coverage',
    testMatch: ['**/test/**/*.test.js'],
    transformIgnorePatterns: [
        '/node_modules/(?!chai|some-other-module)/', // Agrega `chai` al patrón para transformar
    ],
    transform: {
        '^.+\\.[t|j]sx?$': 'babel-jest', // Configuración de Babel
    },
};