"use strict";

import createStore from "store-emitter";
import modifier from "./modifier";
import { Handle, handleOffsets } from "./handle";
import { raf, partiallyApply } from "../../utils";

var EVENTS = {
  selectstart, mousedown, mousemove,
  mouseup, mouseout: mouseup
};

function selectstart(store, e) {
  e.preventDefault();
  return false;
}

function mousedown(store, e) {
  store({
    type: "START_MOVE",
    position: { x: e.layerX, y: e.layerY }
  });
}

function mousemove(store, e) {
  store({
    type: "MOVE",
    position: {x: e.layerX, y: e.layerY}
  });
}

function mouseup(store) {
  store({type: "STOP_MOVE"});
}

function update(state, croppy, store) {
  renderOverlay(state);
  renderHandles(state);
  renderGrid(state);
  croppy.render(state);
  if (state.interaction) raf(update, store.getState(), croppy, store);
}

function renderHandles(state) {

  // 0  1  2
  // 7     3
  // 6  5  4
  const [x1, y1, width, height] = state.cropArea;
  const hw = width/2 + x1;
  const hh = height/2 + y1;
  const w  = width + x1;
  const h  = height + y1;

  let handleCoords = [
    [x1, y1],
    [hw, y1],
    [w, y1],
    [w, hh],
    [w, h],
    [hw, h],
    [x1, h],
    [x1, hh]
  ];

  state.handles.forEach((handle, i) => {
    handle.setCoords(...handleCoords[i]);
    handle.draw(state.context);
  });

  state.context.clearRect(x1 + 5, y1 + 5, width - 10, height - 10);
}

function renderGrid(state) {
  let [x, y, w, h] = state.cropArea;

  let h1 = (w / 3);
  let h2 = h1*2 + x;
  let v1 = (h / 3);
  let v2 = v1*2 + y;

  v1 += y
  h1 += x

  state.context.save();
  state.context.strokeStyle = "rgba(0,0,0,0.7)";
  state.context.beginPath();
  state.context.setLineDash([2]);
  state.context.moveTo(x, v1);
  state.context.lineTo(w + x, v1);
  state.context.moveTo(x, v2);
  state.context.lineTo(w + x, v2);
  state.context.moveTo(h1, y);
  state.context.lineTo(h1, h + y);
  state.context.moveTo(h2, y);
  state.context.lineTo(h2, h + y);
  state.context.stroke();
  state.context.restore();
}

function renderOverlay(state) {
  let {width, height} = state.context.canvas;

  state.context.clearRect(0, 0, width, height);

  state.context.save();
  state.context.fillStyle = "rgba(0,0,0,0.8)";
  state.context.fillRect(0, 0, width, height);

  state.context.beginPath();
  state.context.rect(...state.cropArea);
  state.context.clip()
  state.context.clearRect(...state.cropArea);
  state.context.restore();
}

export default function crop(appState, croppy) {

  const store = createStore(modifier, {
    ...appState,
    startPosition: { x:0, y:0 },
    selectedHandle: -1,
    interaction: "",
    cropArea: [0, 0, appState.image.width, appState.image.height],
    handles: handleOffsets.map(offset => new Handle(offset))
  });

  store.on("START_MOVE", (action, state, oldState) => {
    raf(update, state, croppy, store);
  });

  Object.keys(EVENTS).forEach(function(event){
    appState.context.canvas.addEventListener(
      event, partiallyApply(EVENTS[event], store), true
    );
  });

}
