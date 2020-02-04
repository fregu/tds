// @flow
import React, { type Node } from 'react'
import { useSubscription } from '@apollo/client'
import gql from 'graphql-tag'

export type Props = {
  children: Node
}
export default function TediousProvider({ children }: Props) {
  useSubscription(
    gql(`
      subscription tds {
        tds {
          reload
          updateCss
        }
      }
    `),
    {
      onSubscriptionData: ({
        subscriptionData: { data: { tds } = {} } = {}
      }) => {
        if (typeof window === 'undefined') return false

        if (tds?.reload) {
          console.log('[TDS]: Trigger reload')
          window.location.reload(true)
        } else if (tds?.updateCss) {
          console.log('[TDS]: Updates CSS')
          const stylesheets = window.document.querySelectorAll(
            "link[rel='stylesheet'][href^='/']"
          )

          Array.from(stylesheets).map(style => {
            style.setAttribute(
              'href',
              style.getAttribute('href').split('?')[0] +
                '?t' +
                new Date().getTime()
            )
          })
        }
      }
    }
  )

  return children
}
