import React from 'react'
import Link from 'ui/components/Link'
import Logotype from 'components/Logotype'
import View from 'ui/components/View'

export default function AboutView() {
  return (
    <View title="About Tedious">
      <Logotype />
      <div className="layout-container layout-gutter">
        <p>Tedious is awesome</p>
        <Link to="/">Back to start</Link>
      </div>
    </View>
  )
}
