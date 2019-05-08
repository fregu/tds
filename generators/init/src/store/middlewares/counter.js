import { COUNTER_INCREMENT, COUNTER_DECREMENT } from 'store/actions/counter'

export const counter = ({ dispatch, getState }) => next => action => {
  switch (action.type) {
    case COUNTER_INCREMENT:
      console.log('Wow you just incremented with', action.count)
      break
    case COUNTER_DECREMENT:
      console.log('Oh oh, you just decremented with', action.count)
      break
  }

  return next(action)
}
