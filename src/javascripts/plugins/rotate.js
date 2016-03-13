"use strict";

import createStore from "store-emitter";
import { raf } from "../utils";

const START_ROTATE = "START_ROTATE";
const STOP_ROTATE  = "STOP_ROTATE";
const ROTATE       = "ROTATE";
const FLIP         = "FLIP";

const TO_RADIANS = Math.PI/180;
const ANGLE_LIMIT = 45;

function modifier (action, state) {

  switch (action.type) {
    case START_ROTATE:
      return Object.assign({}, state, {
        startPosition: state.angle - action.position,
        rotating: true
      });

    case STOP_ROTATE:
      return Object.assign({}, state, {
        rotating: false
      });

    case ROTATE:
      if (!state.rotating) { return state; }
      let angle = state.startPosition + action.position;
      return Object.assign({}, state, {
        angle: (angle >= ANGLE_LIMIT) ? ANGLE_LIMIT :
               (angle <= -ANGLE_LIMIT) ? -ANGLE_LIMIT : angle
      });

    case FLIP:
      return Object.assign({}, state, {
        angle: 0,
        flipAngle: action.angle
      });

    default:
      return state;
  }
}

function getScale(angle, width, height) {
  let radians = Math.abs(angle);

  let a = Math.abs(height * Math.sin(radians));
  let b = Math.abs(width * Math.cos(radians));
  let c = Math.abs(width * Math.sin(radians));
  let d = Math.abs(height * Math.cos(radians));

  return Math.max((a + b) / width, (c + d) / height);
};

export default function rotate(appState, croppy) {

  const store = createStore(modifier, {
    ...appState,
    startPosition: 0,
    angle: 0,
    flipAngle: 0,
    rotating: false,
    wheel: createWheel(appState.context.canvas)
  });

  store.on(START_ROTATE, (action, state, oldState) => {
    raf(update, state);
  });

  store.on(FLIP, (action, state, oldState) => {
    update(state);
  });

  function createWheel(element) {
    let wheel  = document.createElement("img");
    let events = {
      selectstart,
      mousedown,
      mousemove,
      mouseup,
      mouseout: mouseup,
      dragstart: selectstart
    };

    wheel.src = "/src/images/rotate-dial-01.svg";
    wheel.classList.add("rotate-wheel");

    Object.keys(events).forEach(event => {
      wheel.addEventListener(event, events[event], true);
    });

    element.parentNode.insertBefore(wheel, element);

    return wheel;
  }

  function selectstart(e) {
    e.preventDefault();
    return false;
  }

  function mousedown(e) {
    store({
      type: START_ROTATE,
      position: e.layerY
    });
  }

  function mousemove(e) {
    store({
      type: ROTATE,
      position: e.layerY
    });
  }

  function mouseup() {
    store({ type: STOP_ROTATE });
  }

  function flip(angle) {
    store({
      type: FLIP,
      angle
    });
  }

  function update(state) {
    let {wheel, context, image, angle, flipAngle} = state;

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

    if (state.rotating) raf(update, store.getState());
  }

  window.flip = flip;

  return {flip};
}
