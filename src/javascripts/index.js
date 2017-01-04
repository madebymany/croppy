'use strict';

import { readFile, loadImage, aspectRatio, checkElement, raf, getScale } from "./utils";
import { createStore, combineReducers, compose } from "redux";
import plugins from "./plugins/index";

function addReducer(list, plugin) {
  list[plugin.name] = plugin.reducer;
  return list;
}

function setCanvas(image, element) {

  if (!image) {
    throw "Error: no image provided";
  }

  let ar = aspectRatio(image);
  let canvas = document.createElement("canvas");

  element = checkElement(element);

  canvas.width  = image.width  = element.offsetWidth;
  canvas.height = image.height = Math.round(image.width * ar)

  element.appendChild(canvas);

  return canvas;
}

function checkPlugins(plugins) {
  plugins.forEach(plugin => {
    ["name", "reducer", "init", "render"].every(key => {
      if (plugin.hasOwnProperty(key) && !!plugin[key]) {
        return true;
      }
      throw(`Method ${key} missing for plugin ${plugin.name}`);
    });
  });
}

async function load(image) {
  if (typeof image === "string") {
    return await loadImage(image, "use credentials");
  }

  if (!/^image/.test(image.type)) {
    throw "Error: file is not an image"; 
  }

  image = await readFile(image);
  return await loadImage(image);
}

export class Croppy {

  constructor(image, element) {
    checkPlugins(plugins);

    load(image).then((image) => {
      this.prepare(image, element);
    });
  }

  prepare(image, element) {

    const reducers = plugins.reduce(addReducer, {});
    const store    = createStore(combineReducers(reducers));
    const context  = setCanvas(image, element).getContext("2d");

    plugins.forEach(({init}) => {
      init(store, image, context);
    });

    this.render(store.getState(), image, context);

    store.subscribe(_ => {
      raf(this.render, store.getState(), image, context);
    });
  }

  render(state, image, context) {
    plugins.forEach(({name, render}) => {
      render(state[name], image, context);
    });

    let scale  = getScale(state.rotate.angle, image.width, image.height);
    let width  = image.width * scale;
    let height = image.height * scale;

    context.save();
    context.translate(context.canvas.width / 2, context.canvas.height / 2);
    context.rotate(state.rotate.angle);
    context.globalCompositeOperation = 'destination-over';
    context.drawImage(
      image,
      -width/2,
      -height/2,
      width,
      height
    );
    context.globalCompositeOperation = 'source-over';
    context.restore();
  }
}
