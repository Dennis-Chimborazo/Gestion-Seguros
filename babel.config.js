// babel.config.js
module.exports = {
  presets: [
    '@babel/preset-env'  // ✅ Solo este es necesario
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs'  // ✅ Si usas import/export
  ],
};
