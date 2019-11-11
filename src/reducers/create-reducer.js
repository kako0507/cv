export default function createReducer(initialState, handlers) {
  return (state = initialState, { type, payload }) => {
    const handler = handlers[type];
    if (typeof handler === 'function') {
      const newState = handler(state, payload);
      if (newState === undefined) {
        return state;
      }
      return {
        ...state,
        ...handler(state, payload),
      };
    }
    return state;
  };
}
