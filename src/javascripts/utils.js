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
