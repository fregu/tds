// @flow
import React from 'react'
import classNames from 'classnames/bind'
import config from '../../config'
const cx = classNames.bind({})

export type Props = {
  className?: string
}

export default function StyleguideComponent({ className }: Props) {
  console.log(config)
  return (
    <div className={cx('StyleguideComponent', className)}>
      StyleguideComponent
    </div>
  )
}
