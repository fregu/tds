// @flow
import React, { Fragment } from 'react'
import classNames from 'classnames/bind'
import State from 'ui/helpers/State'
import Form, { Input } from 'ui/components/Form'
import Button from 'ui/components/Button'
import Title from 'ui/components/Title'
import { Query } from 'react-apollo'
import hello from 'gql/queries/hello.gql'

const cx = classNames.bind({})

export type Props = {
  className?: string
}

export default function Hello({ className }: Props) {
  return (
    <div className={cx('Hello', className)}>
      <State>
        {({ name, setState }) => (
          <Fragment>
            <Form
              onSubmit={(event, formData) => setState({ name: formData.name })}
            >
              <Input
                name="name"
                placeholder="Your name"
                label="What is your name?"
              />
              <Button>Say hello</Button>
            </Form>
            {name ? (
              <Query query={hello} variables={{ name }}>
                {({ data: { hello } = {} }) => <Title text={hello} />}
              </Query>
            ) : null}
          </Fragment>
        )}
      </State>
    </div>
  )
}
