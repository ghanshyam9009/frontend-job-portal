module.exports = {
  plugins: [
    // IE11 can't handle CSS custom properties (`var(--x)`), so we inline
    // them at build time as much as possible.
    require('postcss-custom-properties')({
      preserve: false,
    }),
    require('autoprefixer'),
  ],
};

