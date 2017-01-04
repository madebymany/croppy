"use strict";

const events = new Map();

function selectstart(store, e) {
  e.preventDefault();
  return false;
}
events.set("selectstart", selectstart);
events.set("dragstart", selectstart);

events.set("mousedown", (store, e) => {
  store.dispatch({
    type: "START_ROTATE",
    position: e.layerY
  });
});

events.set("mousemove", (store, e) => {
  store.dispatch({
    type: "ROTATE",
    position: e.layerY
  });
});

function mouseup(store, e) {
  store.dispatch({ type: "STOP_ROTATE" });
}

events.set("mouseup", mouseup);
events.set("mouseout", mouseup);

export default events;
