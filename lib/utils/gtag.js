export default function googleTagManager(trackingId, appName = 'App') {
  if (typeof window === 'undefined') {
    return false
  }
  const hasTagManager = window.__GOOGLE_TAG_MANAGER_KEY__
  const hasAnalytics = window.__GOOGLE_ANALYTICS_KEY__

  if (!trackingId) {
    trackingId = hasAnalytics || hasTagManager
  }

  function gtag(type, ...args) {
    // track event on google tag manager
    if (typeof window.dataLayer !== 'undefined') {
      const dataLayer = window.dataLayer || []
      if (hasAnalytics) {
        dataLayer.push(arguments)
      }

      if (hasTagManager) {
        dataLayer.push({
          type,
          ...(type === 'event' ? { event: args[0] } : {}),
          ...args.reduce(
            (data, arg) =>
              typeof arg === 'string'
                ? { ...data, name: arg }
                : { ...data, ...(arg || {}) },
            {}
          )
        })
      }
    }
  }

  return {
    addKey(key) {
      gtag('config', key)
    },

    event({ action, label = '(not set)', category = 'general', value }) {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: typeof value === 'object' ? JSON.stringify(value) : value
      })
    },

    // This event will not be available for analyics
    custom(data) {
      gtag('custom', data)
    },

    screen({ name, path }) {
      gtag('event', 'screen_view', {
        app_name: appName,
        screen_name: name
      })
    },

    page({
      title,
      path = window.location.pathname,
      url = window.location.href
    }) {
      gtag('config', trackingId, {
        page_title: title,
        page_path: path,
        page_url: url
      })
    },

    error({ description, fatal }) {
      gtag('event', 'exception', {
        description: description,
        fatal
      })
    },

    user({ id }) {
      gtag('config', trackingId, {
        user_id: id
      })
    },

    timing({ name, value, category }) {
      gtag('timing_complete', {
        name: name,
        value: value,
        event_category: category
      })
    }
  }
}
