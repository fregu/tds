import { COUNTER_INCREMENT, COUNTER_DECREMENT } from 'store/actions/counter'

export function counter(state = 0, { type, count = 1 }) {
  switch (type) {
    case COUNTER_INCREMENT:
      return state + Number(count)
    case COUNTER_DECREMENT:
      return state - Number(count)
    default:
      return state
  }
}
