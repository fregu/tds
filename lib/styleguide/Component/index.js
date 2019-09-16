// @flow
import React, { type Node } from 'react'
import classNames from 'classnames/bind'
import PropTypes from '../PropTypes'
import Title from 'ui/components/Title'

const cx = classNames.bind({})

export type Props = {
  className?: string,
  name: string,
  documentation?: Node
}

export default function StyleguideComponent({
  className,
  name,
  documentation,
  props = {}
}: Props) {
  return (
    <div className={cx('StyleguideComponent', className)}>
      <Title level={3} text={name} />
      {props.props ? <PropTypes {...props} /> : null}
      {documentation}
    </div>
  )
}
