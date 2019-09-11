export const storage = (state = {}, { type }) => {
  if (
    typeof window !== 'undefined' &&
    'localStorage' in window &&
    (type === 'STORAGE_UPDATED' || type === '@@INIT')
  ) {
    return { ...JSON.parse(window.localStorage.tdsStorage || '{}') }
  }
  return state
}
