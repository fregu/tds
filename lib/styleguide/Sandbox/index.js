// @flow
import React, { Component } from 'react'
import classNames from 'classnames'

type Props = {
  className?: string,
  component: any,
  props?: any
}

export default class Sandbox extends Component<Props> {
  render() {
    const { className, component: RenderComponent, props = {} } = this.props
    return (
      <div className={classNames('Sandbox', className)}>
        <RenderComponent {...props} />
      </div>
    )
  }
}
