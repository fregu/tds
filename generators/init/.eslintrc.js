module.exports = {
  parser: 'babel-eslint',
  extends: [
    'standard',
    'plugin:react/recommended',
    'prettier',
    'prettier/react',
    'prettier/standard',
    'plugin:flowtype/recommended',
    'prettier/flowtype'
  ],
  env: {
    browser: true,
    node: true,
    jest: true,
    es6: true
  },
  plugins: ['flowtype', 'jsx-a11y', 'react', 'prettier', 'standard']
}
