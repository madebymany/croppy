'use strict';

import events from "events";
import Canvas from "./canvas";
import * as store from "./store";
import {plugins} from "./plugins/index";
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

    privateMap.set(this, {originalImage: image});

    element = checkElement(element);
    image   = image.cloneNode();

    let ar = aspectRatio(image);

    let el = document.createElement("canvas");
    let st = store.createStore({
      image,
      context: el.getContext("2d")
    });

    el.width = image.width  = element.offsetWidth;
    el.height = image.height = Math.round(image.width * ar)

    element.appendChild(el);

    plugins.forEach(plugin => plugin(st, this));
    this.render(st.getState());

  }

  render(state, position = {x:0, y:0}, width, height) {
    state.context.globalCompositeOperation = 'destination-over';
    state.context.drawImage(
      state.image,
      position.x,
      position.y,
      width || state.image.width,
      height || state.image.height
    );
    state.context.globalCompositeOperation = 'source-over';
  }



// {{{
  //use(configurePlugin) {
    //configurePlugin(this);
    //return this;
  //}
// }}}

}

