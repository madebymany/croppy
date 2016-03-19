"use strict";

const ANGLE_LIMIT = 45;

export default function modifier(action, state) {

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
      return Object.assign({}, state, {
        angle: (angle >= ANGLE_LIMIT) ? ANGLE_LIMIT :
               (angle <= -ANGLE_LIMIT) ? -ANGLE_LIMIT : angle
      });

    case "FLIP":
      return Object.assign({}, state, {
        angle: 0,
        flipAngle: action.angle
      });

    default:
      return state;
  }
}

