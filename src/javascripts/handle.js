// 0  1  2
// 7     3
// 6  5  4

const size = 20;
const halfSize = size/2;
const fill = "grey";

export default class Handle {
  constructor() {
    this.setCoords(0, 0);
  }

  setCoords(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(context) {
    context.save();
    context.fillStyle = fill;
    context.translate(-halfSize, -halfSize);
    context.fillRect(this.x, this.y, size, size);
    context.restore();
  }

  contains(mx, my) {
    return (this.x - halfSize <= mx) && (this.x + halfSize >= mx) &&
      (this.y -halfSize <= my) && (this.y + halfSize >= my);
  }
}
