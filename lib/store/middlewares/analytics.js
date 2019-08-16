export const analytics = ({ dispatch, getState }) => next => action => {
  if (typeof window !== 'undefined' && window.dataLayer !== 'undefined') {
    const dataLayer = window.dataLayer || []
    const { type, ...event } = action
    switch (type) {
      case 'TRACK_EVENT':
        dataLayer.push(...event)
    }
  }
}
