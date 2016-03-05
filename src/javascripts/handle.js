// 0  1  2
// 7     3
// 6  5  4

const size = 20;
const fill = "grey";

export default class Handle {
  constructor([x, y]) {
    this.setCoords(0, 0);
    this.offset = {
      x: size * x,
      y: size * y
    };
  }

  setCoords(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(context) {
    context.save();
    context.fillStyle = fill;
    context.translate(-this.offset.x, -this.offset.y);
    context.fillRect(this.x, this.y, size, size);
    context.restore();
  }

  contains(mx, my) {
    let x = this.x - this.offset.x;
    let y = this.y - this.offset.y

    return (x <= mx) && (x + size >= mx) && (y <= my) && (y + size >= my);
  }
}
