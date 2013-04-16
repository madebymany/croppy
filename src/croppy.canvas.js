var Canvas = function(img, aspect_ratio, width) {

  this._set_img(img);
  this._set_orientaion();
  this._set_canvas_el(width, this.aspect_ratio_to_float(aspect_ratio));
  this._set_image_size(img, this.canvas);
  this._set_ctx();
  this._set_coordinate("origin");
  this._set_mouse_events("on");
  this.draw(this.origin);

  return this;

};

Canvas.prototype = {

  _set_image_size : function(img, canvas) {

    var image_ratio = this.calculate_aspect_ratio(
      this.img.width,
      this.img.height
    );

    var height = this.get_height_from_width(this.canvas_el.width, image_ratio);
    var width  = this.get_width_from_height(this.canvas_el.height, image_ratio);

    return this.image_size = {
      width   : (width  < this.canvas_el.width)  ? this.canvas_el.width  : width,
      height  : (height < this.canvas_el.height) ? this.canvas_el.height : height
    };
  },

  _set_orientaion : function() {
    if (this.img.width >= this.img.height) {
      return this.orientation = "landscape";
    }
    return this.orientation = "portrait";
  },

  aspect_ratio_to_float : function(string_ratio) {

    // require aspect ratio defined as a string
    if (typeof string_ratio !== "string") { return false; }

    // convert the string into width and height
    var ratio_array  = string_ratio.split(":"),
        width        = parseInt(ratio_array[0], 10),
        height       = parseInt(ratio_array[1], 10);

    // reverse the aspect ratio if portrait
    return this.orientation === "landscape" ?
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

  _increment_origin : function(origin) {
    this.origin.x += (origin.x || 0);
    this.origin.y += (origin.y || 0);
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

  draw : function(position, width, height) {

    position = position || { x : 0, y : 0 };

    var canvas  = this.get_canvas_el(),
        ctx     = this.get_ctx();

    // clear the canvas (otherwise we get psychadelic trails)
    this._fill_background(this.get_ctx(), canvas.width, canvas.height);

    // draw the image
    ctx.drawImage(
      this.get_img(),
      position.x,
      position.y,
      this.image_size.width,
      this.image_size.height
    );
  },

  _fill_background : function(ctx, width, height) {
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0, 0, width, height);
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