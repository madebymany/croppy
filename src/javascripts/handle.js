const size = 20;
const fill = "grey";
const translateOffset = [[0, 0], [-size, 0], [-size, -size], [0, -size]];


export default class Handle {
  constructor(i) {
    this.position = i;
    this.setCoords(0, 0);
  }

  setCoords(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(context) {
    context.save();
    context.translate(...translateOffset[this.position]);
    context.fillRect(this.x, this.y, size, size);
    context.restore();
  }

  contains(mx, my) {
    return (this.x <= mx) && (this.x + size >= mx) &&
      (this.y <= my) && (this.y + size >= my);
  }
}
