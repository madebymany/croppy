"use strict";

export function createStore(initialState = {}) {
  let state;
  let listeners = [];

  const getState = () => state;

  const setState = action => {
    state = Object.assign({}, state, action);
    listeners.length && listeners.forEach(l => l());
  };

  const subscribe = listener => {
    listeners.push(listener);
  };

  setState(initialState);

  return { getState, setState, subscribe };
};

//export function create(image, canvas = document.createElement("canvas")) {

  //const {width, height} = image;

  //canvas.width = width;
  //canvas.height = height;

  //return {
    //image: image,
    //context: canvas.getContext("2d")
  //};
//}
