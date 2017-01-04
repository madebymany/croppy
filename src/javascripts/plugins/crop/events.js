"use strict";

const events = new Map();

events.set("selectstart", (store, e) => {
  e.preventDefault();
  return false;
});

events.set("mousedown", (store, e) => {
  store.dispatch({
    type: "START_MOVE",
    position: { x: e.layerX, y: e.layerY }
  });
});

events.set("mousemove", (store, e) => {
  store.dispatch({
    type: "MOVE",
    position: {x: e.layerX, y: e.layerY}
  });
});

events.set("mouseup", (store, e) => {
  store.dispatch({type: "STOP_MOVE"});
});

export default events;

