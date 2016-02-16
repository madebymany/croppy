import Handle from "./handle";

export default class CanvasState {
  constructor(image, canvas = document.createElement("canvas")) {

    let {width, height} = image;

    this.handles = Array.apply(null, Array(8)).map((n, i) => {
      return new Handle(i);
    })

    this.image = image;
    this.startPosition = {x:0,y:0};
    this.selectedIndex = -1;
    this.cropArea = [0, 0, width, height];
    this.newCropArea = this.cropArea;
    this.context = canvas.getContext("2d");

    canvas.addEventListener('selectstart', this.selectStart, false);
    canvas.addEventListener('mousedown', this.mouseDown, true);
    canvas.addEventListener('mousemove', this.mouseMove, true);
    canvas.addEventListener('mouseup', this.mouseUp, true);
    canvas.addEventListener('mouseout', this.mouseUp, true);

    canvas.width = width;
    canvas.height = height;

    this.render();
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
    return [x, y, w, h];
  }

  resizeCropArea(mx, my) {
    let [x, y, w, h] = this.cropArea;

    const newx = mx - this.startPosition.x;
    const newy = my - this.startPosition.y;

    // 0  1  2
    // 7     3
    // 6  5  4
    switch (this.selectedIndex) {
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

    return [x, y, w, h];
  }


  mouseDown = (e) => {
    const mx = e.layerX;
    const my = e.layerY;

    this.selectedIndex = this.handles.findIndex((handle, i) => {
      if (!handle.contains(mx, my)) { return false; }
      return true;
    });

    if (this.selectedIndex < 0 && this.insideCropArea(mx, my)) {
      this.isMoving = true;
    }

    if (this.selectedIndex >= 0 || this.isMoving) {
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

    if (this.selectedIndex >= 0) {
      this.newCropArea = this.resizeCropArea(mx, my);
      return;
    }
  }

  mouseUp = () => {
    this.selectedIndex = -1;
    this.isMoving = false;
    this.cropArea = this.newCropArea;
  }

  update = () => {
    if (this.selectedIndex < 0 && !this.isMoving) { return; }
    this.render();
    requestAnimationFrame(this.update);
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
  }
}
