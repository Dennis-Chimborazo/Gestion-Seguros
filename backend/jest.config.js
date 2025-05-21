module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [],  // 🔓 Permite transformar todo, incluso node_modules
  testEnvironment: 'node'
};
