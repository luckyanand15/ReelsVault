module.exports = {
  root: true,
  extends: '@react-native',
  // Built into Hermes, but not in the @react-native preset's globals.
  globals: {
    TextEncoder: 'readonly',
  },
};
