module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // Use your package.json `browserslist` to decide what to transpile.
        useBuiltIns: 'usage',
        corejs: 3,
        modules: false,
      },
    ],
    // Keep classic runtime since most components import `React` directly.
    ['@babel/preset-react', { runtime: 'classic' }],
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        // Use `regenerator-runtime` for async/await transpilation.
        regenerator: true,
        // Don't duplicate core-js polyfills here; `preset-env` handles that.
        corejs: false,
        useESModules: false,
      },
    ],
  ],
};

