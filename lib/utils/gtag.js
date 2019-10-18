export default function googleTagManager(trackingId, appName = 'App') {
  if (typeof window === 'undefined') {
    return false
  }

  function gtag() {
    if (
      !trackingId &&
      (window.GOOGLE_ANALYTICS_KEY || window.__GOOGLE_TAG_MANAGER__)
    ) {
      trackingId =
        window.__GOOGLE_ANALYTICS_KEY__ || window.__GOOGLE_TAG_MANAGER__
    }

    // track event on google tag manager
    if (typeof window.dataLayer !== 'undefined') {
      const dataLayer = window.dataLayer || []
      dataLayer.push(arguments)
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

    screen({ name, path }) {
      gtag('event', 'screen_view', {
        app_name: appName,
        screen_name: name
      })
    },

    page({ title, path, url }) {
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
