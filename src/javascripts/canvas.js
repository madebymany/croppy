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

  mouseDown = (e) => {
    let mx = e.layerX,
        my = e.layerY;

    this.selectedIndex = this.handles.findIndex((handle, i) => {
      if (!handle.contains(mx, my)) { return false; }
      this.startPosition = {
        x: handle.x,
        y: handle.y
      };
      return true;
    });

    requestAnimationFrame(this.update);
  }

  mouseMove = (e) => {
    if (this.selectedIndex < 0) { return; }

    let mx = e.layerX,
        my = e.layerY;

    let [x, y, w, h] = this.cropArea;

    // 0  1  2
    // 7     3
    // 6  5  4
    switch (this.selectedIndex) {
      case 0:
        x = mx;
        y = my;
        w += this.startPosition.x - mx;
        h += this.startPosition.y - my;
        break;
      case 1:
        y = my;
        h += this.startPosition.y - my;
        break;
      case 2:
        y = my;
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
        x = mx;
        w += this.startPosition.x - mx;
        h -= this.startPosition.y - my;
        break;
      case 7:
        x = mx;
        w += this.startPosition.x - mx;
        break;
    }

    this.newCropArea = [x, y, w, h];
  }

  mouseUp = () => {
    if (this.selectedIndex < 0) { return; }
    this.selectedIndex = -1;
    this.cropArea = this.newCropArea;
  }

  update = () => {
    if (this.selectedIndex < 0) { return; }
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
    let [x1, y1, width, height] = this.newCropArea;
    let hw = width/2 + x1;
    let hh = height/2 + y1;
    width  = width + x1;
    height = height + y1;

    let handleCoords = [
      [x1, y1],
      [hw, y1],
      [width, y1],
      [width, hh],
      [width, height],
      [hw, height],
      [x1, height],
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
