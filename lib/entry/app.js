import React from 'react'
import { Route, Switch } from 'react-router-dom'

export default function App({ routes }) {
  return (
    <Switch>
      {routes.map(({ path, component: Component, props = {} }) => (
        <Route
          key={path}
          path={`/${path}`}
          render={() => <Component {...props} />}
        />
      ))}
    </Switch>
  )
}
