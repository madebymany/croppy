"use strict";

const initialState = {
  startPosition: { x:0, y:0 },
  selectedHandle: -1,
  interaction: "",
  cropArea: [0, 0, 0, 0],
  handles: []
};

function fitWithinBounds(state, [x, y, w, h]) {
  const {width, height} = state.context.canvas;

  x = Math.min(Math.max(x, 0), width - w);
  y = Math.min(Math.max(y, 0), height - h);

  return [
    x,
    y,
    Math.min(Math.min(width - x, w), width),
    Math.min(Math.min(height - y, h), height)
  ];
}

function moveCropArea(state, delta) {
  let [x, y, w, h] = state.cropArea;

  x += delta.x;
  y += delta.y;

  return fitWithinBounds(state, [x, y, w, h]);
}

function resizeCropArea(state, delta) {
  let [x, y, w, h] = state.cropArea;

  // 0  1  2
  // 7     3
  // 6  5  4
  switch (state.selectedHandle) {
    case 0:
      x += delta.x;
      y += delta.y;
      w -= delta.x;
      h -= delta.y;
      break;
    case 1:
      y += delta.y;
      h -= delta.y;
      break;
    case 2:
      y += delta.y;
      w += delta.x;
      h -= delta.y;
      break;
    case 3:
      w += delta.x;
      break;
    case 4:
      w += delta.x;
      h += delta.y;
      break;
    case 5:
      h += delta.y;
      break;
    case 6:
      x += delta.x;
      w -= delta.x;
      h += delta.y;
      break;
    case 7:
      x += delta.x;
      w -= delta.x;
      break;
  }

  return fitWithinBounds(state, [x, y, w, h]);
}

function getPositionDelta(position, startPosition) {
  return {
    x: position.x - startPosition.x,
    y: position.y - startPosition.y
  }
}

function findHandleIndex(state, position) {
  return state.handles.findIndex((handle, i) => {
    return handle.contains(position);
  })
}

function insideCropArea(state, position) {
  const [x, y, width, height] = state.cropArea;

  return ((x <= position.x) && (x + width >= position.x) && 
          (y <= position.y) && (y + height >= position.y));
}

export default function reducer(state = initialState, action) {

  switch (action.type) {
    case "@@CROP/INIT":
      let {type, ...rest} = action;
      return Object.assign({}, state, rest);

    case "START_MOVE":
      const selectedHandle = findHandleIndex(state, action.position);
      const interaction =
        selectedHandle >= 0 ? "resizing" :
        insideCropArea(state, action.position) ? "moving" : "";

      return Object.assign({}, state, {
        startPosition: action.position,
        selectedHandle,
        interaction
      });

    case "STOP_MOVE":
      return Object.assign({}, state, {
        interaction: "",
        selectedHandle: -1
      });

    case "MOVE":
      const delta = getPositionDelta(action.position, state.startPosition);
      const cropArea =
        (state.interaction === "moving") ? moveCropArea(state, delta) :
        (state.interaction === "resizing") ? resizeCropArea(state, delta) : null;

      if (!cropArea) return state;

      return Object.assign({}, state, {
        startPosition: action.position,
        cropArea
      });

    default:
      return state;
  }
}

