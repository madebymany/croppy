"use strict";

import createStore from "redux";
import reducer from "./reducer";
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
  store.dispatch({
    type: "START_MOVE",
    position: { x: e.layerX, y: e.layerY }
  });
}

function mousemove(store, e) {
  store.dispatch({
    type: "MOVE",
    position: {x: e.layerX, y: e.layerY}
  });
}

function mouseup(store) {
  store.dispatch({type: "STOP_MOVE"});
}

function update(...args) {
  renderOverlay(...args);
  renderHandles(...args);
  renderGrid(...args);
  //croppy.render(state);
  //if (state.interaction) raf(update, store.getState(), croppy, store);
}

function renderHandles(state, image, context) {

  let {cropArea, handles} = state.crop;

  // 0  1  2
  // 7     3
  // 6  5  4
  const [x1, y1, width, height] = state.crop.cropArea;
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

  handles.forEach((handle, i) => {
    handle.setCoords(...handleCoords[i]);
    handle.draw(context);
  });

  context.clearRect(x1 + 5, y1 + 5, width - 10, height - 10);
}

function renderGrid(state, image, context) {
  let [x, y, w, h] = state.crop.cropArea;

  let h1 = (w / 3);
  let h2 = h1*2 + x;
  let v1 = (h / 3);
  let v2 = v1*2 + y;

  v1 += y
  h1 += x

  context.save();
  context.strokeStyle = "rgba(0,0,0,0.7)";
  context.beginPath();
  context.setLineDash([2]);
  context.moveTo(x, v1);
  context.lineTo(w + x, v1);
  context.moveTo(x, v2);
  context.lineTo(w + x, v2);
  context.moveTo(h1, y);
  context.lineTo(h1, h + y);
  context.moveTo(h2, y);
  context.lineTo(h2, h + y);
  context.stroke();
  context.restore();
}

function renderOverlay(state, image, context) {
  let {width, height} = context.canvas;

  context.clearRect(0, 0, width, height);

  context.save();
  context.fillStyle = "rgba(0,0,0,0.8)";
  context.fillRect(0, 0, width, height);

  context.beginPath();
  context.rect(...state.crop.cropArea);
  context.clip()
  context.clearRect(...state.crop.cropArea);
  context.restore();
}

export default function crop(store, image, context) {

  store.dispatch({
    type: '@@CROP/INIT',
    cropArea: [0, 0, image.width, image.height],
    handles: handleOffsets.map(offset => new Handle(offset))
  })

  //store.on("START_MOVE", (action, state, oldState) => {
    //raf(update, state, croppy, store);
  //});

  Object.keys(EVENTS).forEach(function(event){
    context.canvas.addEventListener(
      event, partiallyApply(EVENTS[event], store), true
    );
  });

  return update;

}
