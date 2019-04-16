import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import * as defaultReducers from "./reducers";
import * as defaultMiddlewares from "./middlewares";

export { default as Connect } from "./Connect";

const composeEnhancers =
  (typeof window !== "undefined" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

export default (
  initialState = { counter: 0 },
  { reducers = {}, middlewares = {} } = {}
) => {
  return createStore(
    combineReducers({ ...reducers, ...defaultReducers }),
    initialState,
    composeEnhancers(
      applyMiddleware(
        ...Object.values(defaultMiddlewares),
        ...Object.values(middlewares)
      )
    )
  );
};
