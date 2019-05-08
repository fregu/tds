import React from 'react'
import Link from 'components/Link'
import Button from 'ui/components/Button'
import Connect from 'ui/helpers/Connect'
import { increment, decrement } from 'store/actions/counter'

export default function StartView() {
  return (
    <div>
      Start page <Link to="/about">About</Link>
      <Connect
        mapStateToProps={({ counter }) => ({ counter })}
        mapDispatchToProps={{ increment, decrement }}
      >
        {({ counter, increment, decrement }) => (
          <div>
            <Button
              hiddenText
              icon={{ type: 'minus' }}
              text="decrement value by 1"
              onClick={() => decrement(1)}
            />
            <span className="layout-gutter">{counter}</span>
            <Button
              hiddenText
              icon={{ type: 'plus' }}
              text="increment value by 1"
              onClick={() => increment(1)}
            />
          </div>
        )}
      </Connect>
    </div>
  )
}
