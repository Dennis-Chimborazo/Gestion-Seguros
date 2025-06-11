module.exports = {
  presets: [
    '@babel/preset-env',  // For compiling ES6+ to code Jest can understand
    '@babel/preset-react', // For compiling JSX
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',  // For transforming ES modules to CommonJS
  ],
};
