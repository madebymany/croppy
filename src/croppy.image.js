var Image = function(img) {

  // this.img = img;

  window.canvas = this.canvas = new Canvas(img, this.aspect_ratio, this.dom_container.offsetWidth);
  this.render();

  return this;
};

Image.prototype = {

  render : function() {
    var ui = new UI();
    ui.appendChild(this.canvas.get_canvas_el());
    this.dom_container.appendChild(ui);
  }

  // enforce_img_min_size : function(dimensions, img) {

  //   // minimum image width and height
  //   if (img.width < dimensions.width ||
  //       img.height < Math.floor(this.aspect_ratio * this.max_width)) {

  //     var scale = this.set_scale(this.max_width, img, false, false);

  //     img.width = scale.width;
  //     img.height = scale.height;
  //   }
  // },

  // // Calculate scale for resizing the image
  // set_scale : function(max, obj, limit, checkScale) {

  //   var width = obj.width,
  //       height = obj.height,
  //       scale = Math.min(
  //         (max) / width,
  //         height
  //       ),
  //       minHeight = ~~(0.5625 * max);

  //   // limit allows us to specify whether we want the scale
  //   // to be restricted to 100% of the max
  //   scale = (limit && scale > 1) ? 1 : scale;

  //   width = parseInt(width * scale, 10);
  //   height = parseInt(height * scale, 10);

  //   // check to see if wee need to increase dimensions to acheive 16 x 9 ratio
  //   if (!checkScale && height < minHeight) {

  //     width = (minHeight / height) * width;
  //     height = minHeight;

  //   }

  //   return {
  //     width : Math.round(width),
  //     height : Math.round(height)
  //   };
  // }

};