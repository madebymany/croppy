"use strict";

const TO_RADIANS = Math.PI/180;
const ANGLE_LIMIT = 45;

const initialState = {
  startPosition: 0,
  angle: 0,
  flipAngle: 0,
  rotating: false
};

export default function reducer(state = initialState, action) {

  switch (action.type) {
    case "START_ROTATE":
      return Object.assign({}, state, {
        startPosition: state.angle - action.position,
        rotating: true
      });

    case "STOP_ROTATE":
      return Object.assign({}, state, {
        rotating: false
      });

    case "ROTATE":
      if (!state.rotating) { return state; }
      let angle = state.startPosition + action.position;
          angle = Math.min(Math.max(angle, -ANGLE_LIMIT), ANGLE_LIMIT);
          angle = (angle * TO_RADIANS) + state.flipAngle;

      return Object.assign({}, state, {
        angle: Math.min(Math.max(angle, -ANGLE_LIMIT), ANGLE_LIMIT)
      });

    case "FLIP":
      return Object.assign({}, state, {
        angle: 0,
        flipAngle: action.angle * TO_RADIANS
      });

    default:
      return state;
  }
}

