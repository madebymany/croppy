"use strict";

import { partiallyApply } from "../../utils";
import events from "./events";

export default function createWheel(element, store) {
  let wheel = document.createElement("img");
      wheel.src = "/src/images/rotate-dial-01.svg";
      wheel.classList.add("rotate-wheel");

  events.forEach((event, name) => {
    wheel.addEventListener(name, partiallyApply(event, store), true);
  });

  element.parentNode.insertBefore(wheel, element);

  store.subscribe(_ => {
    wheel.style.transform =
      `translateZ(0) translateY(-50%) rotate(${store.getState().rotate.angle}rad)`;
  });
}

