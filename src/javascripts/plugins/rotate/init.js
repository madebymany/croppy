"use strict";

import createWheel from "./wheel";

export default function init(store, image, context) {

  const wheel = createWheel(context.canvas, store);

  //store.on("START_ROTATE", function(action, state, oldState) {
    //raf(update, state, wheel, croppy, store);
  //});

  //store.on("FLIP", (action, state, oldState) => {
    //update(state, wheel, croppy, store);
  //});

  //function flip(angle) {
    //store({
      //type: "FLIP",
      //angle
    //});
  //}

  //window.flip = flip;
}
