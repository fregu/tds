```bash
$ yarn add eslint eslint-config-prettier eslint-config-standard eslint-plugin-babel eslint-plugin-flowtype eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-prettier eslint-plugin-promise eslint-plugin-react @babel/core babel-plugin-module-resolver @babel/plugin-proposal-class-properties @babel/plugin-proposal-optional-chaining @babel/preset-react @babel/preset-flow @babel/preset-typescript @babel/preset-env babel-eslint react redux react-redux react-dom react-router graphql graphql/utilities
```

```json
{
  "scripts": {
    "start": "tds start",
    "build": "tds build",
    "eject": "tds eject",
    "server": "node dist/run.js",
    "postinstall": "yarn build"
  }
}
```

Procfile

```
yarn server
```
