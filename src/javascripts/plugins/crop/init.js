"use strict";

import { partiallyApply } from "../../utils";
import { Handle, handleOffsets } from "./handle";
import events from "./events";

export default function init(store, image, context) {

  store.dispatch({
    type: '@@CROP/INIT',
    cropArea: [0, 0, image.width, image.height],
    handles: handleOffsets.map(offset => new Handle(offset)),
    context: context
  })

  events.forEach((event, name) => {
    context.canvas.addEventListener(name, partiallyApply(event, store), true);
  });
}

