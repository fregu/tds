export const storage = ({ dispatch, getState }) => next => action => {
  if (typeof window !== "undefined" && "localStorage" in window) {
    const localStorage = window.localStorage;
    const { type, name, value } = action;

    switch (type) {
      case "STORAGE_SET_ITEM":
        try {
          const parsedValue = JSON.parse(value);
          localStorage.setItem(name, JSON.stringify(parsedValue));
        } catch (err) {
          localStorage.setItem(name, JSON.stringify(value));
        }

        dispatch({ type: "STORAGE_UPDATED", name });
        break;
      case "STORAGE_REMOVE_ITEM":
        localStorage.removeItem(name);
        dispatch({ type: "STORAGE_UPDATED", name });
        break;
      case "STORAGE_CLEAR":
        localStorage.clear();
        dispatch({ type: "STORAGE_UPDATED" });
    }
  }
  next(action);
};
