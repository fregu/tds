// @flow
import React from 'react'
import classNames from 'classnames/bind'
import Category from '../Category'
import Layout from 'ui/containers/Layout'
import { Switch, Route } from 'react-router-dom'
const cx = classNames.bind({})

export type Props = {
  className?: string,
  components: Array<any>
}

export default function Styleguide({
  className,
  components: allComponents = []
}: Props) {
  const categories = allComponents.reduce(
    (categories, { type, ...component }) => ({
      ...categories,
      [type]: [...(categories[type] || []), component]
    }),
    {}
  )
  return (
    <Layout>
      <div className={cx('Styleguide', className)}>
        {Object.keys(categories).map(category => {
          const renderCategory = (
            <Category
              key={category}
              title={category}
              components={categories[category]}
            />
          )
          return <>{renderCategory}</>
        })}
      </div>
    </Layout>
  )
}
