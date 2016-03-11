"use strict";

const TO_RADIANS = Math.PI/180;

export default function rotate(store, croppy) {

  let state = store.getState();
  let canvas = state.context.canvas;

  let wheel = document.createElement("img");
      wheel.src = "/src/images/rotate-dial-01.svg";
      wheel.classList.add("rotate-wheel");

  canvas.parentNode.insertBefore(wheel, canvas);

  let rotateAngle = 0;
  let action = "";
  let angle = 0;
  let startAngle = 0;

  let events = {
    selectstart,
    mousedown,
    mousemove,
    mouseup,
    mouseout: mouseup,
    dragstart: selectstart
  };

  Object.keys(events).forEach(event => {
    wheel.addEventListener(event, events[event], true);
  });

  function selectstart(e) {
    e.preventDefault();
    return false;
  }

  function mousedown(e) {
    action = "ROTATE";
    startAngle = angle + e.layerY;
    requestAnimationFrame(update);
  }

  function mousemove(e) {
    if (!action) { return; }
    angle = (startAngle - e.layerY);
  }

  function mouseup() {
    action = "";
  }

  function getScale() {
    let radians = angle * TO_RADIANS;

    let a = state.image.height * Math.sin(radians);
    let b = state.image.width * Math.cos(radians);
    let c = state.image.width * Math.sin(radians);
    let d = state.image.height * Math.cos(radians);

    //console.log([a, b, c, d]);

    return Math.max(state.image.width / (a + b), state.image.height / (c + d));
  };

  function update() {
    if (!action) { return; }
    let state = store.getState();
    let scale = getScale();
    let width = state.image.width * scale;
    let height = state.image.height * scale;

    //wheel.style.transform = `translateY(-50%) rotate(${angle}deg)`;
    state.context.clearRect(0, 0, canvas.width, canvas.height);
    state.context.save();
    state.context.translate(canvas.width/2, canvas.height/2);
    state.context.rotate(angle * TO_RADIANS);
    croppy.render(state, {x: -width/2, y: -height/2}, width, height);
    state.context.restore(); 
    requestAnimationFrame(update);
  }
}
