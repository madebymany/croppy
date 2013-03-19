var Image = function(img) {

  this.img = img;

  // check for config aspect ratio, or use img dimensions
  if (!this.aspect_ratio.hasOwnProperty('width') || !this.aspect_ratio.hasOwnProperty('height')) {
    this.aspect_ratio = {
      width : img.width,
      heiht : img.height
    };
  }

  this._set_orientaion();

  // this.enforce_img_min_size(this.min_dimensions, this.img);

  this.ui_scale = { width:1000, height:1000};  //this.set_scale(this.ui_width, this.img);

  this.canvas = new Canvas(img, this.aspect_ratio, img);

  this.dom_container.appendChild(this.canvas.get_canvas_el());

  return this;

};

Image.prototype = {

  _set_orientaion : function() {
    if (this.aspect_ratio[0] >= this.aspect_ratio[1]) {
      return this.orientation = "landscape";
    } else {
      return this.orientation = "portrait";
    }
  },

  get_relative_dimensions_from_height : function(width) {
    return this.aspect_ratio[1] / this.aspect_ratio[0] * width;
  },

  get_relative_dimensions_from_width : function(height) {
    return this.aspect_ratio[0] / this.aspect_ratio[1] * height;
  },

  enforce_img_min_size : function(dimensions, img) {

    // minimum image width and height
    if (img.width < dimensions.width || img.height < Math.floor(this.aspect_ratio * this.max_width)) {

      var scale = this.set_scale(this.max_width, img, false, false);

      console.log(img.width, img.height);

      img.width = scale.width;
      img.height = scale.height;

      console.log(img.width, img.height);
    }

  },

  // Calculate scale for resizing the image
  set_scale : function(max, obj, limit, checkScale) {

    var width = obj.width,
        height = obj.height,
        scale = Math.min(
          (max) / width,
          height
        ),
        minHeight = ~~(0.5625 * max);

    // limit allows us to specify whether we want the scale
    // to be restricted to 100% of the max
    scale = (limit && scale > 1) ? 1 : scale;

    width = parseInt(width * scale, 10);
    height = parseInt(height * scale, 10);

    // check to see if wee need to increase dimensions to acheive 16 x 9 ratio
    if (!checkScale && height < minHeight) {

      width = (minHeight / height) * width;
      height = minHeight;

    }

    return {
      width : Math.round(width),
      height : Math.round(height)
    };
  }

};