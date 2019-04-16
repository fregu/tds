import { bindActionCreators } from "redux";
import { connect } from "../webpack/loaders/reactReduxLoader";

const Connect = ({ children, ...props }) => children(props);

export default connect(
  (state, { mapStateToProps, props }) => {
    mapStateToProps = mapStateToProps || props;
    switch (typeof mapStateToProps) {
      case "object":
        if (Array.isArray(mapStateToProps)) {
          return mapStateToProps.reduce(
            (newState, prop) => ({ ...newState, [prop]: state[prop] }),
            {}
          );
        }
        return {};
      case "function":
        return mapStateToProps(state);
      default:
        return state;
    }
  },
  (dispatch, { mapDispatchToProps }) => {
    if (typeof mapDispatchToProps === "object") {
      return { dispatch, ...bindActionCreators(mapDispatchToProps, dispatch) };
    }
    return {
      dispatch,
      ...((mapDispatchToProps && mapDispatchToProps(dispatch)) || {})
    };
  }
)(Connect);
