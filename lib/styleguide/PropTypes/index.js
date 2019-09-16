// @flow
import React from 'react'
import classNames from 'classnames/bind'
import Table from 'ui/components/Table'
const cx = classNames.bind({})

export type Props = {
  className?: string
}

export default function PropTypes({
  className,
  methods,
  description,
  displayName,
  props = {}
}: Props) {
  console.log(props)
  return (
    <div className={cx('PropTypes', className)}>
      <Table
        headers={['prop', 'type', 'required', 'defaultValue', 'description']}
        rows={Object.keys(props).map(prop => {
          const { defaultValue, description, flowType, required } = props[prop]
          return {
            cells: [
              prop,
              flowType?.name,
              required ? 'true' : 'false',
              defaultValue?.value,
              description
            ]
          }
        })}
      />
    </div>
  )
}
