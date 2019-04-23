export const storage = (state = {}, { type }) => {
  if (
    typeof window !== "undefined" &&
    "localStorage" in window &&
    type === "STORAGE_UPDATED"
  ) {
    return { ...window.localStorage };
  }
  return state;
};
