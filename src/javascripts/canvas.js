import Handle from "./handle";

export default class CanvasState {
  constructor({width, height}, canvas = document.createElement("canvas")) {
    this.handles = [0,1,2,3].map(i => {
      return new Handle(i);
    });
    this.dragging = false;
    this.dragoffx = 0;
    this.dragoffy = 0;
    this.selection = null;
    this.coords = [0, 0, width, height];
    this.context = canvas.getContext("2d");

    canvas.addEventListener('selectstart', this.selectStart, false);
    canvas.addEventListener('mousedown', this.mouseDown, true);
    canvas.addEventListener('mousemove', this.mouseMove, true);
    canvas.addEventListener('mouseup', this.mouseUp, true);

    canvas.width = width;
    canvas.height = height;
  }

  selectStart(e) {
    e.preventDefault();
    return false;
  }

  mouseDown = (e) => {
    let mx = e.layerX,
        my = e.layerY;

    let selected = this.handles.some(handle => {
      if (!handle.contains(mx, my)) { return false; }
      this.dragoffx = mx - handle.x;
      this.dragoffy = my - handle.y;
      this.dragging = true;
      this.selection = handle;
      return true;
    });

    if (!selected) {
      this.selection = null;
      return;
    }

    requestAnimationFrame(update);
  }

  mouseMove = (e) => {
    if (!this.dragging) { return; }

    requestAnimationFrame(update);

    let mx = e.layerX,
        my = e.layerY;

    // We don't want to drag the object by its top-left corner, we want to drag it
    // from where we clicked. Thats why we saved the offset and use it here
    this.selection.setCoords(mx - this.dragoffx, my - this.dragoffy);
  }

  mouseUp = () => {
    this.dragging = false;
  }

  render(image, position = {x:0, y:0}) {
    this.context.globalCompositeOperation = 'destination-over';
    this.context.drawImage(
      image,
      position.x,
      position.y,
      image.width,
      image.height
    );
    this.context.globalCompositeOperation = 'source-over';
  }

  renderHandles() {
    let [x1, y1, width, height] = this.coords;
    let x2 = width + x1;
    let y2 = height + y1;
    let handleCoords = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];

    this.context.save();
    this.context.fillStyle = "grey";

    this.handles.forEach((handle, i) => {
      handle.setCoords(...handleCoords[i]);
    });

    this.handles.forEach(handle => {
      handle.draw(this.context);
    });
    this.context.restore();
  }

  renderOverlay() {
    let {width, height} = this.context.canvas;

    this.context.save();
    this.context.fillStyle = "rgba(0,0,0,0.7)";
    this.context.fillRect(0, 0, width, height);

    this.context.beginPath();
    this.context.rect(...this.coords);
    this.context.clip()
    this.context.clearRect(...this.coords);
    this.context.restore();

    this.renderHandles();
  }
}
