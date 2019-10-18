import googleTagManager from '../../utils/gtag'
const analyticsKeys = []
export const analytics = ({ dispatch, getState }) => next => action => {
  next(action)

  if (
    typeof window !== 'undefined' &&
    !(window.GOOGLE_ANALYTICS_KEY || window.__GOOGLE_TAG_MANAGER_KEY__)
  ) {
    const gtag = googleTagManager(
      window.__GOOGLE_ANALYTICS_KEY__ || window.__GOOGLE_TAG_MANAGER_KEY__,
      window.__APP_NAME__ || 'My application'
    )

    const { type, ...event } = action
    switch (type) {
      case 'INIT_APP':
        if (event.analyticsKey && !analyticsKeys.includes(event.analyticsKey)) {
          analyticsKeys.push(event.analyticsKey)
          gtag.addKey(event.analyticsKey)
        }
        if (window.__DOCUMENT_LOAD_TIME__) {
          gtag.timing({
            name: 'PageLoad',
            value: new Date() - window.__DOCUMENT_LOAD_TIME__,
            category: 'Document Ready'
          })
        }
        break
      case 'TRACK_EVENT':
        gtag.event(event) // action, label, category, value
        break
      case 'TRACK_SCREEN':
        gtag.screen(event) // name, path
        break
      case 'TRACK_PAGE':
        gtag.page(event) // title, path, url
        break
      case 'TRACK_ERROR':
        gtag.error(event) // description, fatal
        break
      case 'TRACK_USER':
        gtag.user(event) // id
        break
      case 'TRACK_TIMING':
        gtag.timing(event) // name, value, category
        break
      case 'TRACK_CLICK':
        gtag.event({ action: 'click', ...event }) // name, value, category
        break
    }
  }
}
