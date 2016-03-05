"use strict";

import Handle from "./handle";

export default class CanvasState {
  constructor() {

    let {width, height} = image;

    this.handles = [
      [0,0],
      [.5,0],
      [1,0],
      [1,.5],
      [1,1],
      [.5,1],
      [0,1],
      [0,.5]
    ].map(offset => {
      return new Handle(offset);
    });

    this.startPosition = {x:0,y:0};
    this.selectedHandle = -1;
    this.cropArea = [0, 0, width, height];
    this.newCropArea = this.cropArea;

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

  moveCropArea(mx, my) {
    let [x, y, w, h] = this.cropArea;

    x += mx - this.startPosition.x;
    y += my - this.startPosition.y;

    return this.fitWithinBounds([x, y, w, h]);
  }

  resizeCropArea(mx, my) {
    let [x, y, w, h] = this.cropArea;

    const newx = mx - this.startPosition.x;
    const newy = my - this.startPosition.y;

    // 0  1  2
    // 7     3
    // 6  5  4
    switch (this.selectedHandle) {
      case 0:
        x += newx;
        y += newy;
        w += this.startPosition.x - mx;
        h += this.startPosition.y - my;
        break;
      case 1:
        y += newy;
        h += this.startPosition.y - my;
        break;
      case 2:
        y += newy;
        w += mx - this.startPosition.x;
        h += this.startPosition.y - my;
        break;
      case 3:
        w += mx - this.startPosition.x;
        break;
      case 4:
        w -= this.startPosition.x - mx;
        h -= this.startPosition.y - my;
        break;
      case 5:
        h -= this.startPosition.y - my;
        break;
      case 6:
        x += newx;
        w += this.startPosition.x - mx;
        h -= this.startPosition.y - my;
        break;
      case 7:
        x += newx;
        w += this.startPosition.x - mx;
        break;
    }

    return this.fitWithinBounds([x, y, w, h]);
  }


  mouseDown = (e) => {
    const mx = e.layerX;
    const my = e.layerY;

    this.selectedHandle = this.handles.findIndex((handle, i) => {
      if (!handle.contains(mx, my)) { return false; }
      return true;
    });

    if (this.selectedHandle < 0 && this.insideCropArea(mx, my)) {
      this.isMoving = true;
    }

    if (this.selectedHandle >= 0 || this.isMoving) {
      this.startPosition = { x: mx, y: my };
      requestAnimationFrame(this.update);
    }
  }

  mouseMove = (e) => {

    const mx = e.layerX;
    const my = e.layerY;

    if (this.isMoving){
      this.newCropArea = this.moveCropArea(mx, my);
      return;
    }

    if (this.selectedHandle >= 0) {
      this.newCropArea = this.resizeCropArea(mx, my);
      return;
    }
  }

  mouseUp = () => {
    this.selectedHandle = -1;
    this.isMoving = false;
    this.cropArea = this.newCropArea;
  }

  update = () => {
    if (this.selectedHandle < 0 && !this.isMoving) { return; }
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

  render(position = {x:0, y:0}) {
    this.renderOverlay();
    this.context.globalCompositeOperation = 'destination-over';
    this.context.drawImage(
      this.image,
      position.x,
      position.y,
      this.image.width,
      this.image.height
    );
    this.context.globalCompositeOperation = 'source-over';
  }

  renderHandles() {

    // 0  1  2
    // 7     3
    // 6  5  4
    const [x1, y1, width, height] = this.newCropArea;
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
    let [x, y, w, h] = this.newCropArea;

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
    this.context.rect(...this.newCropArea);
    this.context.clip()
    this.context.clearRect(...this.newCropArea);
    this.context.restore();

    this.renderHandles();
    this.renderGrid();
  }
}

