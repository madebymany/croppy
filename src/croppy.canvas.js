var Canvas = function(img, config) {

  this.config = _.extend(this.config, config);

  this._set_img(img);
  this._set_el();
  this._set_orientation_from_config();

  this._set_common_properties();

  this._set_ctx();
  this._set_mouse_events("on");
  this.draw(this.origin);
};

Canvas.prototype = {

  zoom_amount : 10,

  config : {
    aspect_ratio : '16:9',
    max_mask_size : 160
  },

  _set_common_properties : function() {
    this._set_aspect_ratio_from_config();
    this._set_canvas_size();
    this._set_image_ratio();
    this._set_letterbox_mixin();
    this._set_image_size();
    this._set_crop_window_coordinates();
    this._set_coordinate("origin");
  },

  _set_orientation_from_config : function() {

    if (_.isString(this.config.orientation)) {
      this.orientation = orientation;
      return;
    }

    if (this.img.width >= this.img.height) {
      this.orientation = "landscape";
      return;
    }

    this.orientation = "portrait";
  },

  _swap_orientation : function() {
    this.orientation = (this.orientation === "landscape") ? "portrait" : "landscape";
  },

  _init_letterbox : function() {
    this._set_mask_size.apply(this, arguments);
    this._reset_canvas_height_with_letterbox();
    this._set_letterbox_coordinates();
  },

  _set_letterbox_mixin : function() {

    this._set_raw_image_size();

    if (this.image_size.width < this.canvas_size.width) {
      _.extend(this, letterbox.horizontal);
      this._init_letterbox(this.image_size.height, this.canvas_size.height);
      return;
    }

    if (this.image_size.height < this.canvas_size.height) {
      _.extend(this, letterbox.vertical);
      this._init_letterbox(this.image_size.width, this.canvas_size.width);
      return;
    }

    _.extend(this, letterbox.none);
    this._set_image_size();
  },

  _set_image_ratio : function() {
    this.image_ratio = this.calculate_aspect_ratio(this.img.width, this.img.height);
  },

  _set_raw_image_size : function() {
    this.image_size = {
      height : this.get_height_from_width(this.canvas_size.width, this.image_ratio),
      width  : this.get_width_from_height(this.canvas_size.height, this.image_ratio)
    };
  },

  _set_mask_size : function(image_size, canvas_size) {
    var mask_size = (image_size - canvas_size);
    this.max_mask_size = (mask_size > this.config.max_mask_size) ? this.config.max_mask_size : mask_size;
    this._set_half_mask_size();
  },

  _set_half_mask_size : function() {
    this.half_mask_size = Math.round(this.max_mask_size / 2);
  },

  _set_aspect_ratio_from_config : function() {

    var aspect_ratio = this.config.aspect_ratio;

    // require aspect ratio defined as a string
    if (typeof aspect_ratio !== "string") { return false; }

    // convert the string into width and height
    var ratio_array  = aspect_ratio.split(":"),
        width        = parseInt(ratio_array[0], 10),
        height       = parseInt(ratio_array[1], 10);

    // reverse the aspect ratio if portrait
    this.aspect_ratio = (this.orientation === "landscape") ?
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

  _set_ctx : function() {
    this.ctx = this.el.getContext('2d');
  },

  _set_el : function() {
    this.$el = $("<canvas>");
    this.el  = this.$el[0];
  },

  _set_canvas_size : function() {
    this.canvas_size = {
      width : this.config.width,
      height : this.get_height_from_width(this.config.width, this.aspect_ratio)
    };
    this.el.width = this.canvas_size.width;
    this.el.height = this.canvas_size.height;
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

  // convenience function for adding event listeners to the canvas
  on : function(event, el, callback) {
    (el || this.el)
      .addEventListener(event, (callback || this), false);
  },

  // convenience function for removing event listeners from the canvas
  off : function(event, el, callback) {
    (el || this.el)
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
    this.ctx.drawImage(
      this.img,
      position.x,
      position.y,
      this.image_size.width,
      this.image_size.height
    );

    this._draw_letter_box();
  },

  // this is the letterbox that appears at the top and bottom
  // of the image in the editor. Needs to be redrawn every time
  // the canvas is redrawn
  _draw_letter_box : function() {

    // if the letterbox_coordinates don't exist redefine this function as a noop
    if (!this.letterbox_coordinates) {
      this._draw_letter_box = function(){};
      return;
    }

    // otherwise redefine the function
    this._draw_letter_box = function() {
      var mask = this.letterbox_coordinates;
      this._redraw_canvas(function(ctx) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect.apply(ctx, mask[0]);
        ctx.fillRect.apply(ctx, mask[1]);
      });
    };

    this._draw_letter_box();
  },

  _fill_background : function() {
    var canvas_size = this.canvas_size;
    this._redraw_canvas(function(ctx) {
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.fillRect(0, 0, canvas_size.width, canvas_size.height);
    });
  },

  _redraw_canvas : function(callback) {
    var ctx = this.ctx;
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
        start_position    = this.start_position;

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

  coordiate_correction : function(image_dimension, top_left_offset, bottom_right_offset, origin_offset) {

    var difference = (image_dimension + origin_offset);

    // too far down or right (snap back to TOP or LHS)
    if (difference > (image_dimension + top_left_offset)) {
      return -origin_offset + top_left_offset;
    }

    // too far up or left (snap back to BOTTOM or RHS)
    if (difference < bottom_right_offset) {
      return Math.round(bottom_right_offset - difference);
    }

    return 0;
  },

  _update_translate_origin : function(coordinate) {
    // reset the origin (top left) to the new location (top left) of the image
    this._increment_origin(coordinate);
    // set the translate origin to the new position
    this.ctx.translate(coordinate.x, coordinate.y);
  },

  _snap_to_bounds : function() {

    // calculate the horzontal (x) and vertical (y) correction needed
    // to snap the image back into place
    var correction = {
      x : this.coordiate_correction(this.image_size.width, this.crop_window[0], this.crop_window[2], this.origin.x),
      y : this.coordiate_correction(this.image_size.height, this.crop_window[1], this.crop_window[3], this.origin.y)
    };

    // unless there is no need to perform a correction
    if (correction.x === 0 && correction.y === 0) { return false; }

    // redraw the image in the correct position
    this.draw(correction);
    // set the translate origin to the new position
    this._update_translate_origin(correction);

    return true;
  },

  _is_smaller_than_crop_window : function(image_size) {
    // too short
    if (image_size.height < (this.crop_window[3] - this.crop_window[1])) {
      return true;
    }
    // too thin
    if (image_size.width < (this.crop_window[2] - this.crop_window[0])) {
      return true;
    }
    return false;
  },

  _modify_image_size : function(image_size) {
    if (this._is_smaller_than_crop_window(image_size)) {
      return false;
    }
    this.image_size = image_size;
  },

  _perform_zoom : function(zoom_amount) {
    var width  = this.image_size.width + zoom_amount,
        height = this.get_height_from_width(width, this.image_ratio);

    this._modify_image_size({ width : width, height : height });
    this._snap_to_bounds() || this.draw();
  },

  actions : {
    zoomin : function() {
      this._perform_zoom(this.zoom_amount);
    },

    zoomout : function() {
      this._perform_zoom(-this.zoom_amount);
    },

    done : function() {
      console.log("done");
    },

    redo : function() {
      console.log("redo");
    },

    new_image : function() {
      console.log("new_image");
    },

    orientation : function() {
      this._swap_orientation();
      var cached_image_size = this.image_size;
      this._set_common_properties();
      this._modify_image_size(cached_image_size);
      this._snap_to_bounds() || this.draw();
    }
  }

};