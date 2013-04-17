var Canvas = function(img, aspect_ratio, width) {

  this._set_img(img);
  this._set_canvas_el(width, this.aspect_ratio_to_float(aspect_ratio));
  this._set_size_and_mask(img, this.get_canvas_el());
  this._set_ctx();
  this._set_coordinate("origin");
  this._set_mouse_events("on");
  this.draw(this.origin);

  return this;

};

Canvas.prototype = {

  max_mask_size : 160,

  _set_size_and_mask : function(img, canvas_el) {

    var image_ratio = this.calculate_aspect_ratio(img.width, img.height),
        height      = this.get_height_from_width(canvas_el.width, image_ratio),
        width       = this.get_width_from_height(canvas_el.height, image_ratio),
        mask_size;

    if (width < canvas_el.width) {
      mask_size = this._get_mask_size(height, canvas_el.height);
      this._set_size_with_horizontal_mask(height, canvas_el, mask_size);
      this._set_horizontal_mask(this.image_size, canvas_el, mask_size);
      return;
    }

    if (height < canvas_el.height) {
      mask_size = this._get_mask_size(width, canvas_el.width);
      this._set_size_with_vertical_mask(width, canvas_el, mask_size, image_ratio);
      this._set_vertical_mask(this.image_size, canvas_el, mask_size);
      return;
    }
  },

  _set_size_with_horizontal_mask : function(height, canvas_el, mask_size) {
    canvas_el.height += mask_size;
    this.image_size = {
      width : canvas_el.width,
      height : height
    };
  },

  _set_horizontal_mask : function(image_size, canvas_el, mask_size) {
    mask_size = mask_size / 2;
    this.mask = [
      [0, 0, image_size.width, mask_size],
      [0, (canvas_el.height - mask_size), image_size.width, mask_size]
    ];
  },

  _set_size_with_vertical_mask : function(width, canvas_el, mask_size, image_ratio) {
    var height = canvas_el.height = this.get_height_from_width(canvas_el.width - mask_size, this.aspect_ratio);
    this.image_size = {
      width : this.get_width_from_height(height, image_ratio),
      height : height
    };
  },

  _set_vertical_mask : function(image_size, canvas_el, mask_size) {
    mask_size = mask_size / 2;
    this.mask = [
      [0, 0, mask_size, image_size.height],
      [(canvas_el.width - mask_size), 0, mask_size, image_size.height]
    ];
  },

  _get_mask_size : function(image_size, canvas_size) {
    var mask_size = (image_size - canvas_size);
    return (mask_size > this.max_mask_size) ? this.max_mask_size : mask_size;
  },

  aspect_ratio_to_float : function(string_ratio) {

    // require aspect ratio defined as a string
    if (typeof string_ratio !== "string") { return false; }

    // convert the string into width and height
    var ratio_array  = string_ratio.split(":"),
        width        = parseInt(ratio_array[0], 10),
        height       = parseInt(ratio_array[1], 10);

    // reverse the aspect ratio if portrait
    return this.aspect_ratio = (this.img.width >= this.img.height) ?
      this.calculate_aspect_ratio(width, height) :
      this.calculate_aspect_ratio(height, width);
  },

  calculate_aspect_ratio : function(width, height) {
    return height / width;
  },

  get_height_from_width : function(width, aspect_ratio) {
    return Math.round(width * aspect_ratio);
  },

  get_width_from_height : function(height, aspect_ratio) {
    return Math.round(height / aspect_ratio);
  },

  // is the user panning (moving the image)
  is_panning : false,

  _set_img : function(img) {
    this.img = img;
  },

  get_img : function() {
    return this.img;
  },

  _set_ctx : function() {
    this.ctx = this.canvas_el.getContext('2d');
  },

  get_ctx : function() {
    return this.ctx;
  },

  _set_canvas_el : function(width, aspect_ratio) {
    return this.canvas_el = CroppyDom.createElement("canvas", {
      width : width,
      height : this.get_height_from_width(width, aspect_ratio)
    });
  },

  get_canvas_el : function() {
    return this.canvas_el;
  },

  // baseline for origin of the image relative to top left of canvas
  // this will move around every time we redraw the image
  _set_coordinate : function(name, coordinate) {
    this[name] = coordinate || { x : 0, y : 0 };
  },

  _increment_origin : function(coorinate) {
    this.origin.x += (coorinate.x || 0);
    this.origin.y += (coorinate.y || 0);
  },

  get_origin : function() {
    return this.origin;
  },

  // convenience function for adding event listeners to the canvas
  on : function(event, el, callback) {
    (el || this.get_canvas_el())
      .addEventListener(event, (callback || this), false);
  },

  // convenience function for removing event listeners from the canvas
  off : function(event, el, callback) {
    (el || this.get_canvas_el())
      .removeEventListener(event, (callback || this), false);
  },

  // Refernced by this when using addEventListener
  // Allows us to persist Canvas scope in callbacks
  handleEvent : function(e) {
    e.preventDefault();
    switch(e.type) {
      case "mousedown": this._on_mousedown(e); break;
      case "mousemove": this._on_mousemove(e); break;
      case "mouseup":
      case "mouseleave":
      case "mouseout": this._on_mouseup(e); break;
    }
  },

  _set_mouse_events : function(method) {
    [
      "mousedown",
      "mousemove",
      "mouseup",
      "mouseleave"
    ].forEach(function(event){
      this[method](event);
    }, this);

    this[method]("mouseup", window);
  },

  draw : function(position) {

    position = position || { x : 0, y : 0 };

    // clear the canvas (otherwise we get psychadelic trails)
    this._fill_background();

    // draw the image
    this.get_ctx().drawImage(
      this.get_img(),
      position.x,
      position.y,
      this.image_size.width,
      this.image_size.height
    );

    this._draw_letter_box(this.mask);
  },

  // this is the letterbox that appears at the top and bottom
  // of the image in the editor. Needs to be redrawn every time
  // the canvas is redrawn
  _draw_letter_box : function(mask) {
    this._redraw_canvas(function(ctx) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect.apply(ctx, mask[0]);
      ctx.fillRect.apply(ctx, mask[1]);
    });
  },

  _fill_background : function() {
    var canvas = this.get_canvas_el();
    this._redraw_canvas(function(ctx) {
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
  },

  _redraw_canvas : function(callback) {
    var ctx = this.get_ctx();
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    callback(ctx);
    ctx.restore();
  },

  get_mouse_position : function(e) {
    return {
      x : e.layerX,
      y : e.layerY
    };
  },

  _set_start_position : function(e) {
    this.start_position = this.get_mouse_position(e);
  },

  get_start_position : function(e) {
    return this.start_position;
  },

  _on_mousedown : function(e) {
    // reset distance moved to 0:0
    this._set_coordinate("_distance_moved");

    // we are panning, start tracking the mouse position
    this.is_panning = true;

    // cache the start position,
    // so we can track the mouse move relative to this point
    this._set_start_position(e);

  },

  _on_mousemove : function(e) {
    // if we are no longer panning, stop tracking the mouse position
    if (!this.is_panning) { return; }

    var current_position  = this.get_mouse_position(e),
        start_position    = this.get_start_position();

    // Track the difference between the cached start
    // and current mouse position
    this._set_coordinate("_distance_moved", {
      x : current_position.x - start_position.x,
      y : current_position.y - start_position.y
    });

    // move the image by the difference between the cached start
    // and current mouse position
    this.draw(this._distance_moved);

  },

  _on_mouseup : function(e) {
    // if we are no longer panning, stop tracking the mouse position
    if (!this.is_panning) { return; }
    // we are no longer panning stop tracking the mouse position
    this.is_panning = false;

    // the origin has moved relative to the movement of the image
    this._update_translate_origin(this._distance_moved);

    // check that we haven't overstepped the bounds of the crop area
    this._snap_to_bounds();
  },

  coordiate_correction : function(image_dimension, canvas_dimension, origin_offset) {

    var difference = (image_dimension + origin_offset);

    // too far down or right (snap back to TOP or LHS)
    if (difference > image_dimension) {
      return -origin_offset;
    }

    // too far up or left (snap back to BOTTOM or RHS)
    if (difference < canvas_dimension) {
      return ~~(canvas_dimension - difference);
    }

    return 0;
  },

  _update_translate_origin : function(coordinate) {
    // reset the origin (top left) to the new location (top left) of the image
    this._increment_origin(coordinate);
    // set the translate origin to the new position
    this.get_ctx().translate(coordinate.x, coordinate.y);
  },

  _snap_to_bounds : function() {

    var canvas     = this.get_canvas_el(),
        image_size = this.image_size;

    // calculate the horzontal (x) and vertical (y) correction needed
    // to snap the image back into place
    var correction = {
      x : this.coordiate_correction(image_size.width, canvas.width, this.origin.x),
      y : this.coordiate_correction(image_size.height, canvas.height, this.origin.y)
    };

    // unless there is no need to perform a correction
    if (correction.x === 0 && correction.y === 0) { return; }

    // redraw the image in the correct position
    this.draw(correction);
    // set the translate origin to the new position
    this._update_translate_origin(correction);
  }

};