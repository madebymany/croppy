"use default";

const initialState = {

};

export default function rootReducer(state = initialState, action) {

  switch (action.type) {
    case "UPDATE_IMAGE":
      return Object.assign({}, state, {
        startPosition: state.angle - action.position,
        rotating: true
      });

    default:
      return state;
  }
}
