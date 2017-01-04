export function readFile(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = function() {
      reject(reader.error);
    };
    reader.onload = function() {
      resolve(reader.result);
      return reader.result;
    };
  });
};

export function loadImage(src, crossOrigin = null) {
  return new Promise(function(resolve, reject) {
    var image = new Image();
    image.onerror = function() {
      reject.apply(reject, attributes);
    };
    image.onload = function() {
      resolve(image);
      return image;
    };
    image.src = src;
  });
};

export function aspectRatio({width, height}) {
  return height / width;
};

export function checkElement(element) {
  if (element === null) {
    throw "Error: no element provided";
  }
  if (typeof element === "string") {
    return document.querySelector(element);
  }
  return element;
};

export function getScale(angle, width, height) {
  let radians = Math.abs(angle);

  let a = Math.abs(height * Math.sin(radians));
  let b = Math.abs(width * Math.cos(radians));
  let c = Math.abs(width * Math.sin(radians));
  let d = Math.abs(height * Math.cos(radians));

  return Math.max((a + b) / width, (c + d) / height);
};

export function raf(callback, ...args) {
  return requestAnimationFrame(t => callback(...args));
};

export function partiallyApply(callback, ...partialArgs) {
  return (...remainingArgs) => {
    return callback.apply(this, [...partialArgs, ...remainingArgs]);
  };
}
