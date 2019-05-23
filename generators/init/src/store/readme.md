# Store

`@jayway/tds` comes with Redux as a global state manager. It is used internally to handle tracking, hot module reloading, local storage and cookie management.

Redux uses actions with are dispatched at the store and can be intercepted by either reducers, which manipulates the store or middlewares which might take separate actions before dispatching new actions of it's own.

Any middlewares or reducers defined in the directpry `middlewares` or `reducers` will automatically be included in the state machine.

## Actions

Actions is nothing more than objects containing the property `type`.
They can be imported and dispatched on the store via the connect method or `<Connect />` helper in `@jayway/tds-ui`

An action usually consists of a const name, and a actionDispatcher method.

```js
export const MY_ACTION = 'MY_ACTION'

export const triggerMyAction = value => ({
  type: MY_ACTION,
  value
})
```

## Reducers

Reducers have the task of immutibly modify the store, by listening to certain action types. The exported name of the reducer will automatically become the field in the store which it controls.

```js
import { MY_ACTION } from 'store/actions/myAction'

export function myState(state = 0, { type, value }) {
  switch (type) {
    case MY_ACTION:
      return value
    default:
      return state
  }
}
```

## Middlewares

Middlewares are methods which can intercept or act on actions dispathed on the store.
This can be used to trigger new actions, make API calls, read or write from storage etc.

```js
import { triggerMyAction } from 'store/actions/myAction'
import { OTHER_ACTION } from 'store/actions/otherAction'

export const myState = ({ dispatch, getState }) => next => action => {
  switch (action.type) {
    case OTHER_ACTION:
      // Some other action just happened, lets dubble its value or something
      dispatch(triggerMyAction(action.value * 2))
      break
  }
  // Always remember to call next(action) to let other middlewares and reducers catch the action
  return next(action)
}
```

## Using the <Connect /> helper

The Connect helper in tds-ui makes interacting with the store easy in your components.

```js
import React from 'react'
import Button from 'ui/components/Button'
import Connect from 'ui/helpers/Connect'
import { triggerMyAction } from 'store/actions/myAction'

export default () => (
  <Connect mapDispatchToProps={{triggerMyAction}} mapStateToProps={({myState})=>({myState})}>
    {({triggerMyAction, myState}) => (
      <div>
        Current state value is {myState}
      </div>
      <Button onClick={()=> triggerMyAction(myState+1)}>Add one</Button>
    )}
  </Connect>
)
```
