var InterfaceCanvas = function(img, config) {

  this.config = _.extend(this.config, config);

  window.croppy = this;

  this.zoom_level = 0;
  this.rotation_angle = 0;

  this._set_img(img);
  this._set_orientation_from_config();

  this._set_canvas();

  this._set_common_properties();

  this._set_mouse_events("addEvent");
  this.draw_to_canvas(this.origin);

  this.on();

};

_.extend(InterfaceCanvas.prototype, Eventable, {

  zoom_amount : 10,

  config : {
    aspect_ratio : '16:9',
    max_mask_size : 160
  },

  _set_canvas : function() {
    this.canvas = new Canvas();
    this.crop_canvas = new Canvas();
  },

  _set_common_properties : function() {
    this._get_aspect_ratio_from_config();
    this.canvas.set_width_and_height(this.config.width, this.aspect_ratio);
    this._set_image_ratio();
    this._set_letterbox_mixin();
    this.letterbox._set_image_size.call(this);
    this._set_cached_image_size();
    this.letterbox._set_crop_window_coordinates.call(this);
    this._set_coordinate("origin");
  },

  _set_orientation_from_config : function() {

    var has_orientation = _.contains(["landscape", "portrait"], this.config.orientation);

    if (has_orientation) {
      this.orientation = this.config.orientation;
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
    this.letterbox._reset_canvas_height_with_letterbox.call(this);
    this.letterbox._set_letterbox_coordinates.call(this);
  },

  _set_letterbox_mixin : function() {

    this._set_raw_image_size();

    if (this.image_size.width < this.canvas.get_width()) {
      // _.extend(this, letterbox.horizontal);
      this.letterbox = letterbox.horizontal;
      this._init_letterbox(this.image_size.height, this.canvas.get_height());
      return;
    }

    if (this.image_size.height < this.canvas.get_height()) {
      // _.extend(this, letterbox.vertical);
      this.letterbox = letterbox.vertical;
      this._init_letterbox(this.image_size.width, this.canvas.get_width());
      return;
    }

    // _.extend(this, letterbox.none);
    this.letterbox = letterbox.none;
  },

  _set_cached_image_size : function() {
    this.cached_image_size = this.image_size;
  },

  _set_image_ratio : function() {
    this.image_ratio = calculate_aspect_ratio(this.img.width, this.img.height);
  },

  _set_raw_image_size : function() {
    this.image_size = {
      height : get_height_from_width(this.canvas.get_width(), this.image_ratio),
      width  : get_width_from_height(this.canvas.get_height(), this.image_ratio)
    };
  },

  _set_mask_size : function(image_size, canvas_size) {
    var mask_size = (image_size - canvas_size);

    this.max_mask_size = (mask_size > this.config.max_mask_size) ?
      this.config.max_mask_size :
      mask_size;

    this._set_half_mask_size();
  },

  _set_half_mask_size : function() {
    this.half_mask_size = Math.round(this.max_mask_size / 2);
  },

  _get_aspect_ratio_from_config : function() {

    var aspect_ratio = this.config.aspect_ratio;

    // require aspect ratio defined as a string
    if (typeof aspect_ratio !== "string") { return false; }

    // convert the string into width and height
    aspect_ratio = aspect_ratio.split(":");

    this._set_aspect_ratio(parseInt(aspect_ratio[0], 10), parseInt(aspect_ratio[1], 10));
  },

  _set_aspect_ratio : function(width, height) {
    // reverse the aspect ratio if portrait
    this.aspect_ratio = (this.orientation === "landscape") ?
      calculate_aspect_ratio(width, height) :
      calculate_aspect_ratio(height, width);
  },

  // is the user panning (moving the image)
  is_panning : false,

  _set_img : function(img) {
    this.img = img;
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
  addEvent : function(event) {
    this.canvas.el.addEventListener(event, this, false);
  },

  // convenience function for removing event listeners from the canvas
  removeEvent : function(event) {
    this.canvas.el.removeEventListener(event, this, false);
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
    ].forEach(this[method], this);

    this[method]("mouseup", window);
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
      this.canvas.redraw(function(ctx) {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect.apply(ctx, this.letterbox_coordinates[0]);
        ctx.fillRect.apply(ctx, this.letterbox_coordinates[1]);
      }, this);
    };

    this._draw_letter_box();
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
    this.draw_to_canvas(this._distance_moved);

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
    this.canvas.translate(coordinate);
  },

  _snap_to_bounds : function() {

    if(this.rotation_angle) {
      return false;
    }

    // calculate the horzontal (x) and vertical (y) correction needed
    // to snap the image back into place
    var correction = {
      x : this.coordiate_correction(
        this.image_size.width,
        this.crop_window[0],
        this.crop_window[2],
        this.origin.x
      ),
      y : this.coordiate_correction(
        this.image_size.height,
        this.crop_window[1],
        this.crop_window[3],
        this.origin.y
      )
    };

    // unless there is no need to perform a correction
    if (correction.x === 0 && correction.y === 0) { return false; }

    // redraw the image in the correct position
    this.draw_to_canvas(correction);
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

  _perform_zoom : function() {
    var width  = this.cached_image_size.width + (this.zoom_amount * this.zoom_level),
        height = get_height_from_width(width, this.image_ratio);

    this._modify_image_size({ width : width, height : height });
    this._snap_to_bounds() || this.draw_to_canvas();
  },

  _increment_rotation_angle : function() {
    this.rotation_angle += 90;
    this.rotation_angle = (this.rotation_angle >= 360) ? 0 : this.rotation_angle;
  },

  _get_transformed_coords : function(position){
    if(!this.rotation_angle) {
      return position;
    }
    var radians = this.rotation_angle * Math.PI/180;
    return {
      x: Math.round(position.x * Math.cos(radians) + position.y * Math.sin(radians)),
      y: Math.round(-position.x * Math.sin(radians) + position.y * Math.cos(radians))
    };
  },

  draw_to_canvas : function(position) {
    position = position || { x : 0, y : 0 };
    this.canvas[this.rotation_angle ? "rotate_and_draw" : "draw"]
      (this._get_transformed_coords(position), this.img, this.image_size, this.rotation_angle);
    this._draw_letter_box();

    if (this.text) {
      this.canvas.render_text(this.text, this.distribution, this.alignment, this.crop_window);
    }
  },

  crop : function() {
    var crop_scale = _.partial(scale, this.img.width / this.image_size.width);
    var canvas = new Canvas();
    var crop_window = _.map(this.crop_window, crop_scale, this);

    var position = {
      x : crop_scale(this.origin.x) - crop_window[0],
      y : crop_scale(this.origin.y) - crop_window[1]
    };

    canvas.set_width(crop_window[2] - crop_window[0]);
    canvas.set_height(crop_window[3] - crop_window[1]);

    canvas[this.rotation_angle ? "rotate_and_draw" : "draw"](
        this._get_transformed_coords(position), this.img, this.img, this.rotation_angle);

    if (this.text) {
      canvas.render_text(this.text, this.distribution, this.alignment, null, crop_scale);
    }

    return canvas.el.toDataURL("image/jpeg");
  },

  handle_text_input: function(data) {
    this.text = data || DEFAULT_TEXT;
    this.draw_to_canvas();
  },

  handle_text_action: function(type, value) {
    this[type] = value;
    this.draw_to_canvas();
  },

  actions : {
    zoomin : function() {
      ++this.zoom_level;
      this._perform_zoom();
    },

    zoomout : function() {
      if (this.zoom_level <= 0) { return false; }
      --this.zoom_level;
      this._perform_zoom();
    },

    done : function() {
      var image = document.createElement("img");
      image.src = this.crop();
      this.trigger("cropped", this.crop());
    },

    rotate : function() {
      this._increment_rotation_angle();
      this.draw_to_canvas({
        x : -(this.image_size.width/2),
        y : -(this.image_size.height/2)
      });

      this._set_common_properties();
      this._perform_zoom();
      this._snap_to_bounds() || this.draw_to_canvas();
    },

    orientation : function() {
      this._swap_orientation();
      this._set_common_properties();
      this._perform_zoom();
      this._snap_to_bounds() || this.draw_to_canvas();
    },
  }

});
