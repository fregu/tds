// @flow
import React, { type Node } from 'react'
import classNames from 'classnames/bind'
const cx = classNames.bind({})

export type Props = {
  className?: string,
  name: string,
  documentation?: Node
}

export default function StyleguideComponent({
  className,
  name,
  documentation: Documentation
}: Props) {
  return (
    <div className={cx('StyleguideComponent', className)}>
      StyleguideComponent {name}
      {Documentation ? <Documentation /> : null}
    </div>
  )
}
