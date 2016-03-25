'use strict';

import { readFile, loadImage, aspectRatio, checkElement} from "./utils";
import { createStore, combineReducers, compose } from "redux";
import plugins from "./plugins/index";

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

export class Croppy {

  constructor(image, element) {

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

    el.width = image.width  = element.offsetWidth;
    el.height = image.height = Math.round(image.width * ar)

    element.appendChild(el);

    const reducers = plugins.reduce((memo, plugin) => {
      let {name, reducer, main} = plugin;

      if (!name || !reducer || !main) {
        console.warn(`Methods missing for ${name}. Plugin not loaded`);
        return memo;
      }

      memo[name] = reducer;
      return memo;
    }, {});

    const store = createStore(combineReducers(reducers));
    const context = el.getContext("2d");

    const renderers = plugins.map((plugin) => {
      return plugin.main(store, image, context);
    });

    this.renderers = compose(...renderers);

    this.render(store.getState(), image, context);
  }

  render(state, image, context) {
    this.renderers(state, image, context);
    context.globalCompositeOperation = 'destination-over';
    context.drawImage(
      image,
      0,
      0,
      image.width,
      image.height
    );
    context.globalCompositeOperation = 'source-over';
  }



// {{{
  //use(configurePlugin) {
    //configurePlugin(this);
    //return this;
  //}
// }}}

}

