"use strict";

import { partiallyApply } from "../../utils";

const EVENTS = {
  selectstart, mousedown, mousemove, mouseup,
  mouseout: mouseup,
  dragstart: selectstart
};

export default function createWheel(element, store) {
  let wheel = document.createElement("img");
      wheel.src = "/src/images/rotate-dial-01.svg";
      wheel.classList.add("rotate-wheel");

  Object.keys(EVENTS).forEach(event => {
    wheel.addEventListener(event, partiallyApply(EVENTS[event], store), true);
  });

  element.parentNode.insertBefore(wheel, element);

  return wheel;
}

function selectstart(store, e) {
  e.preventDefault();
  return false;
}

function mousedown(store, e) {
  store({
    type: "START_ROTATE",
    position: e.layerY
  });
}

function mousemove(store, e) {
  store({
    type: "ROTATE",
    position: e.layerY
  });
}

function mouseup(store) {
  store({ type: "STOP_ROTATE" });
}

