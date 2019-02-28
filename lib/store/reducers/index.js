export const counter = (state = 0, { type, step = 1 }) => {
  switch (type) {
    case 'INCREMENT':
      return state + step
    case 'DECREMENT':
      return state - step
    default:
      return state
  }
}
