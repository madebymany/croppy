'use strict';

import events from "events";
import Canvas from "./canvas";
import { readFile, loadImage, aspectRatio} from "./utils";

const privateMap = new WeakMap();

// {{{
//const DEFAULTS = {
  //zoom: 0,
  //angle: 0,
  //orientation: "landscape",
  //aspectRatio: 0.5625, // 16:9
  //maxLetterboxHeight: 80
//};
// }}}

export class ImageineThat extends events.EventEmitter {

  constructor(el, options) {
    super();
    this.el = el;
  }

  async load(input) {
    let img;

    if (typeof input === "string") {
      img = await loadImage(input, "use credentials");
      this.initialize(img);
      return;
    }

    if (!/^image/.test(input.type)) { 
      throw "Error: file is not an image"; 
    }

    img = await readFile(input);
    img = await loadImage(img);
    this.initialize(img);
  }

  initialize(image) {
    let ar = aspectRatio(image);
    privateMap.set({originalImage: image});

    image = image.cloneNode();
    image.width  = this.el.offsetWidth;
    image.height = Math.round(image.width * ar)

    var canvas = new Canvas(image);
    canvas.renderOverlay(image);
    canvas.render(image);
    this.el.appendChild(canvas.context.canvas);
  }

// {{{
  //use(configurePlugin) {
    //configurePlugin(this);
    //return this;
  //}
// }}}

}

