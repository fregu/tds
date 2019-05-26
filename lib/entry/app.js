import React from 'react'
import { Route, Switch } from 'react-router-dom'

export default function App({ routes }) {
  return (
    <Switch>
      {routes.map(({ path, component: Component, props = {} }) => (
        <Route path={`/${path}`} render={() => <Component {...props} />} />
      ))}
    </Switch>
  )
}
