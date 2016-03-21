// 0  1  2
// 7     3
// 6  5  4

const size = 20;
const fill = "grey";

export class Handle {
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

  contains(mouse) {
    let x = this.x - this.offset.x;
    let y = this.y - this.offset.y

    return (x <= mouse.x) && (x + size >= mouse.x) &&
           (y <= mouse.y) && (y + size >= mouse.y);
  }
}

export var handleOffsets = [
  [0,0],
  [.5,0],
  [1,0],
  [1,.5],
  [1,1],
  [.5,1],
  [0,1],
  [0,.5]
];
