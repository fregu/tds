// @flow
import React from 'react'
import classNames from 'classnames/bind'
import Title from 'ui/components/Title'
import Component from '../Component'

const cx = classNames.bind({})

export type Props = {
  className?: string
}

export default function Category({ title, components = [], className }: Props) {
  return (
    <article className={cx('Category', className)}>
      <Title text={title} level={2} />
      {components.map(component => (
        <Component key={component.path} {...component} />
      ))}
    </article>
  )
}
