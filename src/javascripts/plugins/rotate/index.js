"use strict";

import createStore from "store-emitter";
import createWheel from "./wheel";
import modifier from "./modifier";
import { raf } from "../../utils";

const TO_RADIANS = Math.PI/180;

function getScale(angle, width, height) {
  let radians = Math.abs(angle);

  let a = Math.abs(height * Math.sin(radians));
  let b = Math.abs(width * Math.cos(radians));
  let c = Math.abs(width * Math.sin(radians));
  let d = Math.abs(height * Math.cos(radians));

  return Math.max((a + b) / width, (c + d) / height);
};

function update(state, wheel, croppy, store) {
  let {context, image, angle, flipAngle} = state;

  flipAngle = flipAngle * TO_RADIANS;
  angle = angle * TO_RADIANS;

  let scale  = getScale(angle + flipAngle, image.width, image.height);
  let width  = image.width * scale;
  let height = image.height * scale;

  wheel.style.transform = `translateZ(0) translateY(-50%) rotate(${angle}rad)`;

  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.save();
  context.translate(context.canvas.width / 2, context.canvas.height / 2);
  context.rotate(angle + flipAngle);
  croppy.render(state, {x: -width / 2, y: -height / 2}, width, height);
  context.restore();

  if (state.rotating) raf(update, store.getState(), wheel, croppy, store);
}

export default function rotate(appState, croppy) {

  const store = createStore(modifier, {
    ...appState,
    startPosition: 0,
    angle: 0,
    flipAngle: 0,
    rotating: false
  });

  const wheel = createWheel(appState.context.canvas, store);

  store.on("START_ROTATE", function(action, state, oldState) {
    raf(update, state, wheel, croppy, store);
  });

  store.on("FLIP", (action, state, oldState) => {
    update(state, wheel, croppy, store);
  });

  function flip(angle) {
    store({
      type: "FLIP",
      angle
    });
  }

  window.flip = flip;

  return {flip};
}
