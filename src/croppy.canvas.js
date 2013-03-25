var Canvas = function(dimensions, aspect_ratio, img) {

  this._set_canvas_el();

  /*
    fix mask size and ratio height

  */
  // this._set_ratio_height(aspect_ratio, dimensions.width);

  // this._set_mask_size(dimensions);

  this._set_ctx();

  this._set_origin();

  this._set_img(img);

  this.canvas_el.width = dimensions.width;
  this.canvas_el.height = dimensions.height;

  this._set_mouse_events("on");

  this.draw(this.origin);

  return this;

};

Canvas.prototype = {

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

  _set_canvas_el : function() {
    this.canvas_el = document.createElement("canvas");
  },

  get_canvas_el : function() {
    return this.canvas_el;
  },

  // _set_ratio_height : function(aspect_ratio, width) {
  //   this.ratio_height = Math.round(aspect_ratio * width);
  // },

  // get_ratio_height : function() {
  //   return this.ratio_height;
  // },

  // _set_mask_size : function(dimensions) {
  //   var mask_size = (dimensions.height - this.ratio_height) / 2;
  //   this.mask_size = (mask_size < 0) ? 0 : mask_size;
  // },

  // get_mask_size : function() {
  //   return this.mask_size;
  // },

  // baseline for origin of the image relative to top left of canvas
  // this will move around every time we redraw the image
  _set_origin : function(origin) {
    // if origin is null or undefined (deliberate ==)
    this.origin = (origin != null) ? origin : { x : 0, y : 0 };
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

    position = position || {
      x : 0,
      y : 0
    };

    var canvas  = this.get_canvas_el(),
        ctx     = this.get_ctx();

    // clear the canvas (otherwise we get psychadelic trails)
    this._fill_background(this.get_ctx(), canvas.width, canvas.height);

    // draw the image
    ctx.drawImage(this.get_img(), position.x, position.y, canvas.width, canvas.height);

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
    this._set_origin({
      x : current_position.x - start_position.x,
      y : current_position.y - start_position.y
    });

    // move the image by the difference between the cached start
    // and current mouse position
    this.draw(this.get_origin());

  },

  _on_mouseup : function(e) {

    // if we are no longer panning, stop tracking the mouse position
    if (!this.is_panning) { return; }

    // we are no longer panning stop tracking the mouse position
    this.is_panning = false;

    // check that we haven't overstepped the bounds of the crop area
    this._check_bounds();
  },

  _calculate_correction : function(scale_offset, canvas_offset, origin) {

    var difference = (scale_offset + origin);

    // too far down or right (snap back to TOP or LHS)
    if (difference > scale_offset) {
      return -origin;
    }

    // too far up or left (snap back to BOTTOM or RHS)
    else if (difference < scale_offset) {
      return canvas_offset - difference;
    }

  },

  _check_bounds : function() {

    var image   = this.get_img(),
        canvas  = this.get_canvas_el();
        origin  = this.get_origin(),

        // calculate the horzontal (x) and vertical (y) correction needed
        // to snap the image back into place
        x_correction = this._calculate_correction(image.width, canvas.width, origin.x);
        y_correction = this._calculate_correction(image.height, canvas.height, origin.y);

    // unless there is no need to perform a correction
    if (x_correction !== 0 && y_correction !== 0) {

      // add the correction to the origin, so that we can keep track of the
      // position relative to the top left of the canvas
      this.origin.x += x_correction;
      this.origin.y += y_correction;

      // redraw the image in the correct position
      this.draw(this.origin);
    }

    // set the translate origin to the new position
    this.get_ctx().translate(this.origin.x, this.origin.y);
  }

};