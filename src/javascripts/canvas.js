"use strict";

import {Handle, handleOffsets} from "./handle";

const MOVE = "MOVE";
const RESIZE = "RESIZE";

export default class CanvasState {
  constructor(image, canvas = document.createElement("canvas")) {

    let {width, height} = image;

    canvas.width = width;
    canvas.height = height;

    this.image = image;
    this.context = canvas.getContext("2d");

    //createStore({
      //image: image,
      //context: canvas.getContext("2d"),
      //handles: handleOffsets.map(offset => {
        //return new Handle(offset);
      //}),
      //action: "",
      //startPosition: {x:0,y:0},
      //selectedHandle: -1,
      //cropArea: [0, 0, width, height]
    //});

    var events = {
      "selectstart": this.selectStart,
      "mousedown": this.mouseDown,
      "mousemove": this.mouseMove,
      "mouseup": this.mouseUp,
      "mouseout": this.mouseUp
    };
    Object.keys(events).forEach(function(event){
      canvas.addEventListener(event, events[event], true);
    });

    this.render();
  }

  changeState(f) {
    f(this);
  }

  selectStart(e) {
    e.preventDefault();
    return false;
  }

  insideCropArea(mx, my) {
    const [x, y, width, height] = this.cropArea;
    return ((x <= mx) && (x + width >= mx) && (y <= my) && (y + height >= my));
  }

  moveCropArea(deltaX, deltaY) {
    let [x, y, w, h] = this.cropArea;

    x += deltaX;
    y += deltaY;

    return this.fitWithinBounds([x, y, w, h]);
  }

  resizeCropArea(deltaX, deltaY) {
    let [x, y, w, h] = this.cropArea;

    // 0  1  2
    // 7     3
    // 6  5  4
    switch (this.selectedHandle) {
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

    return this.fitWithinBounds([x, y, w, h]);
  }


  mouseDown = (e) => {
    const mx = e.layerX;
    const my = e.layerY;

    this.startPosition = { x: mx, y: my };

    this.selectedHandle = this.handles.findIndex((handle, i) => {
      return handle.contains(mx, my);
    });

    if (this.selectedHandle >= 0) {
      this.action = RESIZE;
      requestAnimationFrame(this.update);
      return;
    }

    if (this.insideCropArea(mx, my)) {
      this.action = MOVE;
      requestAnimationFrame(this.update);
      return;
    }
  }

  mouseMove = (e) => {

    const newPosition = {x: e.layerX, y: e.layerY};
    const deltaX = newPosition.x - this.startPosition.x;
    const deltaY = newPosition.y - this.startPosition.y;

    if (this.action === MOVE){
      this.cropArea = this.moveCropArea(deltaX, deltaY);
      this.startPosition = newPosition;
      return;
    }

    if (this.action === RESIZE) {
      this.cropArea = this.resizeCropArea(deltaX, deltaY);
      this.startPosition = newPosition;
      return;
    }
  }

  mouseUp = () => {
    this.action = "";
  }

  update = () => {
    if (!this.action) { return; }
    this.render();
    requestAnimationFrame(this.update);
  }

  fitWithinBounds([x, y, w, h]) {
    const {width, height} = this.context.canvas;

    const newx = Math.min(Math.max(x, 0), width - w);
    const newy = Math.min(Math.max(y, 0), height - h);

    return [
      newx,
      newy,
      Math.min(Math.min(width - newx, w), width),
      Math.min(Math.min(height - newy, h), height)
    ];
  }

  renderHandles() {

    // 0  1  2
    // 7     3
    // 6  5  4
    const [x1, y1, width, height] = this.cropArea;
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

    this.handles.forEach((handle, i) => {
      handle.setCoords(...handleCoords[i]);
      handle.draw(this.context);
    });

    this.context.clearRect(x1 + 5, y1 + 5, width - 10, height - 10);
  }

  renderGrid() {
    let [x, y, w, h] = this.cropArea;

    let h1 = (w / 3);
    let h2 = h1*2 + x;
    let v1 = (h / 3);
    let v2 = v1*2 + y;

    v1 += y
    h1 += x

    this.context.save();
    this.context.strokeStyle = "rgba(0,0,0,0.7)";
    this.context.beginPath();
    this.context.setLineDash([2]);
    this.context.moveTo(x, v1);
    this.context.lineTo(w + x, v1);
    this.context.moveTo(x, v2);
    this.context.lineTo(w + x, v2);
    this.context.moveTo(h1, y);
    this.context.lineTo(h1, h + y);
    this.context.moveTo(h2, y);
    this.context.lineTo(h2, h + y);
    this.context.stroke();
    this.context.restore();
  }

  renderOverlay() {
    let {width, height} = this.context.canvas;

    this.context.clearRect(0, 0, width, height);

    this.context.save();
    this.context.fillStyle = "rgba(0,0,0,0.8)";
    this.context.fillRect(0, 0, width, height);

    this.context.beginPath();
    this.context.rect(...this.cropArea);
    this.context.clip()
    this.context.clearRect(...this.cropArea);
    this.context.restore();

    this.renderHandles();
    this.renderGrid();
  }
}
