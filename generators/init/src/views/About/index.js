import React from 'react'
import Link from 'ui/components/Link'
import View from 'ui/components/View'

export default function AboutView() {
  return (
    <View title="About Tedious">
      <p>Tedious is awesome</p>
      <Link to="/">Back to start</Link>
    </View>
  )
}
