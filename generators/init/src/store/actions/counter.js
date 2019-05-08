export const COUNTER_INCREMENT = 'COUNTER_INCREMENT'
export const COUNTER_DECREMENT = 'COUNTER_DECREMENT'

export const increment = count => ({
  type: COUNTER_INCREMENT,
  count
})
export const decrement = count => ({
  type: COUNTER_DECREMENT,
  count
})
