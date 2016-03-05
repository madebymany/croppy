'use strict';

import events from "events";
import Canvas from "./canvas";
import { readFile, loadImage, aspectRatio, checkElement} from "./utils";

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

export class Croppy extends events.EventEmitter {

  constructor(image, element) {

    super();

    this.element = checkElement(element);

    this.load(image).then((image) => {
      this.appendTo(image, element);
    });
  }

  async load(image) {
    if (typeof image === "string") {
      return await loadImage(image, "use credentials");
    }

    if (!/^image/.test(image.type)) {
      throw "Error: file is not an image"; 
    }

    image = await readFile(image);
    return await loadImage(image);
  }

  appendTo(image, element) {

    if (!image) {
      throw "Error: no image provided";
    }

    privateMap.set({originalImage: image});

    element = checkElement(element);
    image   = image.cloneNode();

    let ar = aspectRatio(image);

    image.width  = element.offsetWidth;
    image.height = Math.round(image.width * ar)

    let canvas = new Canvas(image);

    element.appendChild(canvas.context.canvas);
  }


// {{{
  //use(configurePlugin) {
    //configurePlugin(this);
    //return this;
  //}
// }}}

}

