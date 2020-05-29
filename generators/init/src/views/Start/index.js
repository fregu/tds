import React from 'react'
import Link from 'ui/components/Link'
import Counter from 'components/Counter'
import Hello from 'containers/Hello'
import Logotype from 'components/Logotype'
import Title from 'ui/components/Title'
import Divider from 'ui/components/Divider'
import View from 'ui/components/View'

export default function StartView() {
  return (
    <View title="Hello World" theme="text-center">
      <div className="layout-container layout-gutter">
        <Logotype />
        <Title text="Start page" />
        <Link to="/about">About</Link>
        <Counter />
        <Divider thin />
        <Hello />
      </div>
    </View>
  )
}
