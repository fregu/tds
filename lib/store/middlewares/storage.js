const storageKey = 'tdsStorage'

export const storage = ({ dispatch, getState }) => next => action => {
  if (
    typeof window !== 'undefined' &&
    'localStorage' in window &&
    action?.type.match(/^STORAGE/)
  ) {
    const localStorage = window.localStorage
    let state = getState().storage || {}

    const setItem = (name, value) =>
      localStorage.setItem(
        storageKey,
        JSON.stringify({ ...state, [name]: value })
      )

    const removeItem = name =>
      localStorage.setItem(
        storageKey,
        JSON.stringify(
          Object.keys(state)
            .filter(key => key !== name)
            .reduce((newState, key) => ({ ...newState, [key]: state[key] }), {})
        )
      )

    const clear = name => localStorage.removeItem(storageKey)

    const { type, name, value } = action

    switch (type) {
      case 'STORAGE_SET_ITEM':
        setItem(name, value)
        dispatch({ type: 'STORAGE_UPDATED' })
        break
      case 'STORAGE_REMOVE_ITEM':
        removeItem(name)
        dispatch({ type: 'STORAGE_UPDATED' })
        break
      case 'STORAGE_CLEAR':
        clear()
        dispatch({ type: 'STORAGE_UPDATED' })
    }
  }
  next(action)
}
