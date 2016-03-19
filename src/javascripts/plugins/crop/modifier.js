"use strict";

export default function modifier ({type, ...action}, state) {

  switch (type) {
    case "START_MOVE":
      return Object.assign({}, state, {...action, moving: true});

    case "STOP_MOVE":
      return Object.assign({}, state, {
        moving: false
      });

    case "MOVE":
      const newPosition = {x: e.layerX, y: e.layerY};
      const deltaX = newPosition.x - startPosition.x;
      const deltaY = newPosition.y - startPosition.y;

      return state;

      //if (action === "MOVE"){
        //cropArea = moveCropArea(deltaX, deltaY);
        //startPosition = newPosition;
        //return;
      //}

      //if (action === "RESIZE") {
        //cropArea = resizeCropArea(deltaX, deltaY);
        //startPosition = newPosition;
        //return;
      //}

    default:
      return state;
  }
}

