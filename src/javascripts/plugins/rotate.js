"use strict";

const TO_RADIANS = Math.PI/180;
const ANGLE_LIMIT = 45;

export default function rotate(store, croppy) {

  let state = store.getState();
  let canvas = state.context.canvas;

  let wheel = document.createElement("img");
      wheel.src = "/src/images/rotate-dial-01.svg";
      wheel.classList.add("rotate-wheel");

  //let boom = document.createElement("div");
  //boom.classList.add("boom");

  canvas.parentNode.insertBefore(wheel, canvas);
  //canvas.parentNode.insertBefore(boom, canvas);
  //boom.style.width = `${state.image.width}px`;
  //boom.style.height = `${state.image.height}px`;

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
    angle = (angle >= ANGLE_LIMIT) ? ANGLE_LIMIT :
            (angle <= -ANGLE_LIMIT) ? -ANGLE_LIMIT : angle;
  }

  function mouseup() {
    action = "";
  }

  function getScale() {
    let radians = Math.abs(angle * TO_RADIANS);

    let a = Math.abs(state.image.height * Math.sin(radians));
    let b = Math.abs(state.image.width * Math.cos(radians));
    let c = Math.abs(state.image.width * Math.sin(radians));
    let d = Math.abs(state.image.height * Math.cos(radians));

    return Math.max((a+b) / state.image.width, (c+d) / state.image.height);
  };

  function update() {
    if (!action) { return; }
    let state = store.getState();
    let scale = getScale();
    let width =  state.image.width * scale;
    let height =  state.image.height * scale;

    //boom.style.transform = `translateZ(0) rotate(${angle}deg)`;
    wheel.style.transform = `translateZ(0) translateY(-50%) rotate(${angle}deg)`;
    state.context.clearRect(0, 0, canvas.width, canvas.height);
    state.context.save();
    state.context.translate(canvas.width/2, canvas.height/2);
    state.context.rotate(angle * TO_RADIANS);
    croppy.render(state, {x: -width/2, y: -height/2}, width, height);
    state.context.restore(); 
    requestAnimationFrame(update);
  }

  function flip(a) {
    angle = a;
    action = "flip";
    update();
    action = "";
  }

  window.flip = flip;

  return {flip};
}
