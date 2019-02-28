// @flow
import React, { type Node, Component } from 'react'
import classNames from 'classnames'
import Sandbox from '../styleguide/Sandbox'

type Props = {
  className?: string,
  component: Node,
  props?: any
}
type State = {
  props?: any
}
// With toolbar to change props to Sandbox
export default class Playground extends Component<Props, State> {
  state = {}
  render() {
    const { className, component, props: defaultProps = {} } = this.props
    const { props = defaultProps } = this.state
    return (
      <div className={classNames('Playground', className)}>
        <Sandbox component={component} props={props} />
      </div>
    )
  }
}
