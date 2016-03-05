
    let wheel = document.createElement("img");
    wheel.src = "/src/images/rotate-dial-01.svg";
    wheel.classList.add("rotate-wheel");
    element.insertBefore(wheel, canvas.context.canvas);

    this.rotateAngle = 0;

    let events = {
      "selectstart": this.selectStart,
      "mousedown": this.mouseDown,
      "mousemove": this.mouseMove,
      "mouseup": this.mouseUp,
      "mouseout": this.mouseUp,
      "dragstart": this.selectStart
    };
    Object.keys(events).forEach(event => {
      wheel.addEventListener(event, events[event], true);
    });
  }

  selectStart(e) {
    e.preventDefault();
    return false;
  }

  mouseDown(e) {
    this.rotating = true;

    const my = e.layerY;

    this.angle = this.angle || 0;
    this.startPos = this.angle + my;
  }

  mouseMove(e) {
    if (!this.rotating) { return; }

    const mx = e.layerX;
    const my = e.layerY;

    this.angle = this.startPos + my;

    e.currentTarget.style.transform = `translateY(-50%) rotate(${this.angle}deg)`;
  }

  mouseUp() {
    this.rotating = false;
  }
