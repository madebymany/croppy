"use strict";

import createStore from "store-emitter";
import modifier from "./modifier";
import { Handle, handleOffsets } from "./handle";
import { raf } from "../../utils";

var EVENTS = {
  selectstart, mousedown, mousemove,
  mouseup, mouseout: mouseup
};

function selectstart(store, e) {
  e.preventDefault();
  return false;
}

function mousedown(store, e) {
  const startPosition = { x: e.layerX, y: e.layerY };
  const selectedHandle = store.handles.findIndex((handle, i) => {
    return handle.contains(startPosition);
  });

  store({
    type: "START_MOVE",
    startPosition,
    selectedHandle
  });
}

function mousemove(store, e) {
  store({
    type: "MOVE",
    position: {x: e.layerX, y: e.layerY}
  });
}

function mouseup(store) {
  action = "";
}

function insideCropArea(state, mx, my) {
  const [x, y, width, height] = state.cropArea;
  return ((x <= mx) && (x + width >= mx) && (y <= my) && (y + height >= my));
}

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

function moveCropArea(state, deltaX, deltaY) {
  let [x, y, w, h] = state.cropArea;

  x += deltaX;
  y += deltaY;

  return fitWithinBounds(state, [x, y, w, h]);
}

function resizeCropArea(state, deltaX, deltaY) {
  let [x, y, w, h] = state.cropArea;

  // 0  1  2
  // 7     3
  // 6  5  4
  switch (state.selectedHandle) {
    case 0:
      x += deltaX;
      y += deltaY;
      w -= deltaX;
      h -= deltaY;
      break;
    case 1:
      y += deltaY;
      h -= deltaY;
      break;
    case 2:
      y += deltaY;
      w += deltaX;
      h -= deltaY;
      break;
    case 3:
      w += deltaX;
      break;
    case 4:
      w += deltaX;
      h += deltaY;
      break;
    case 5:
      h += deltaY;
      break;
    case 6:
      x += deltaX;
      w -= deltaX;
      h += deltaY;
      break;
    case 7:
      x += deltaX;
      w -= deltaX;
      break;
  }

  return fitWithinBounds(state, [x, y, w, h]);
}


export default function crop(appState, croppy) {

  const store = createStore(modifier, {
    ...appState,
    startPosition: { x:0, y:0 },
    moving: false,
    selectedHandle: -1,
    cropArea: [0, 0, appState.image.width, appState.image.height],
    handles: handleOffsets.map(offset => new Handle(offset))
  });

  store.on("START_MOVE", (action, state, oldState) => {
    raf(update, state);
  });

  Object.keys(EVENTS).forEach(function(event){
    appState.context.canvas.addEventListener(
      event, partiallyApply(EVENTS[event], store), true
    );
  });

  function update(state) {
    if (!action) { return; }
    renderOverlay(state);
    renderHandles(state);
    renderGrid(state);
    croppy.render(state);
    requestAnimationFrame(update);
    if (state.moving) store.getState();
  }

 function renderHandles(state) {

    // 0  1  2
    // 7     3
    // 6  5  4
    const [x1, y1, width, height] = cropArea;
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
      handle.draw(state.context);
    });

    state.context.clearRect(x1 + 5, y1 + 5, width - 10, height - 10);
  }

  function renderGrid(state) {
    let [x, y, w, h] = cropArea;

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
    state.context.rect(...cropArea);
    state.context.clip()
    state.context.clearRect(...cropArea);
    state.context.restore();
  }
}
