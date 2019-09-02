export default function googleTagManager(trackingId, appName = 'App') {
  function gtag() {
    if (typeof window === 'undefined' || !trackingId) {
      return false
    }
    const dataLayer = window?.dataLayer || []
    dataLayer.push(arguments)
  }

  gtag('js', new Date())
  gtag('config', trackingId, { send_page_view: false })

  return {
    event({ action, label = '(not set)', category = 'general', value }) {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value
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

    error(description, fatal) {
      gtag('event', 'exception', {
        description: description,
        fatal
      })
    },

    user(id) {
      gtag('config', trackingId, {
        user_id: id
      })
    },

    timing(name, value, category) {
      gtag('timing_complete', {
        name: name,
        value: value,
        event_category: category
      })
    }
  }
}
