var EventEmitter = require('events');
var inherits = require('util').inherits;
var ListenToEmitter = require('listento-emitter');

var Canvas = require('./canvas.js');
var utils = require('./utils.js');
var letterbox = require('./letterbox_mixins.js')

var InterfaceCanvas = function(img, config) {
  EventEmitter.call(this);

  this.config = Object.assign(this.config, config);

  this.zoom_level = 0;
  this.rotation_angle = 0;

  this._set_img(img);
  this._set_orientation_from_config();

  this._set_canvas();

  this._set_aspect_ratio(this.config.aspect_ratio);
  this._set_common_properties();

  this._set_mouse_events("addEvent");
  this.draw_to_canvas(this.origin);
};

module.exports = InterfaceCanvas

inherits(InterfaceCanvas, EventEmitter);

Object.assign(InterfaceCanvas.prototype, ListenToEmitter, {

  zoom_amount : 10,

  config : {
    aspect_ratio : '16:9',
    max_mask_size : 160
  },

  _set_canvas : function() {
    this.canvas = new Canvas(this.config);
    this.crop_canvas = new Canvas(this.config);
  },

  _set_common_properties : function() {
    this.canvas.set_width_and_height(this.config.width, this.aspect_ratio);
    this._set_image_ratio();
    this._set_letterbox_mixin();
    this.letterbox._set_image_size.call(this);
    this._set_cached_image_size();
    this.letterbox._set_crop_window_coordinates.call(this);
    this._set_coordinate("origin");
  },

  _set_orientation_from_config : function() {

    var has_orientation = ["landscape", "portrait"].includes(
        this.config.orientation);

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
      // Object.assign(this, letterbox.horizontal);
      this.letterbox = letterbox.horizontal;
      this._init_letterbox(this.image_size.height, this.canvas.get_height());
      return;
    }

    if (this.image_size.height < this.canvas.get_height()) {
      // Object.assign(this, letterbox.vertical);
      this.letterbox = letterbox.vertical;
      this._init_letterbox(this.image_size.width, this.canvas.get_width());
      return;
    }

    this.letterbox = letterbox.none;
    this._init_letterbox(0, 0);

  },

  _set_cached_image_size : function() {
    this.cached_image_size = this.image_size;
  },

  _set_image_ratio : function() {
    this.image_ratio = utils.calculate_aspect_ratio(this.img.width,
        this.img.height);
  },

  _set_raw_image_size : function() {
    this.image_size = {
      height : utils.get_height_from_width(this.canvas.get_width(), this.image_ratio),
      width  : utils.get_width_from_height(this.canvas.get_height(), this.image_ratio)
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

  },

  _set_aspect_ratio : function(aspect_ratio) {
    // require aspect ratio defined as a string
    if (typeof aspect_ratio !== "string") { return false; }

    // convert the string into width and height
    aspect_ratio = aspect_ratio.split(":");

    var width = parseInt(aspect_ratio[0], 10);
    var height = parseInt(aspect_ratio[1], 10);

    // reverse the aspect ratio if portrait
    this.aspect_ratio = (this.orientation === "landscape") ?
      utils.calculate_aspect_ratio(width, height) :
      utils.calculate_aspect_ratio(height, width);
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
    if (!this.letterbox_coordinates) {
      return;
    }
    this.canvas.redraw(function(ctx) {
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect.apply(ctx, this.letterbox_coordinates[0]);
      ctx.fillRect.apply(ctx, this.letterbox_coordinates[1]);
    }, this);
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

  coordiate_correction : function(dimension, top_left_offset, bottom_right_offset, origin_offset) {

    var image_dimension = this.image_size[dimension];
    var canvas_dimension = this.canvas[dimension];

    var difference = (image_dimension + origin_offset);

    if (image_dimension < (bottom_right_offset - top_left_offset)) {
      return ((canvas_dimension - image_dimension) / 2) - origin_offset;
    }

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

    var x = 0, y = 0;

    if(this.rotation_angle) {
      return false;
    }

    x = this.coordiate_correction(
          "width",
          this.crop_window[0],
          this.crop_window[2],
          this.origin.x
        );

    y = this.coordiate_correction(
          "height",
          this.crop_window[1],
          this.crop_window[3],
          this.origin.y
        );

    // unless there is no need to perform a correction
    if (!x && !y) { return false; }

    // calculate the horzontal (x) and vertical (y) correction needed
    // to snap the image back into place
    var correction = { x: x, y: y };

    // redraw the image in the correct position
    this.draw_to_canvas(correction);

    // set the translate origin to the new position
    this._update_translate_origin(correction);

    return true;
  },

  _perform_zoom : function() {
    var width  = this.cached_image_size.width + (this.zoom_amount * this.zoom_level),
        height = utils.get_height_from_width(width, this.image_ratio);

    this.image_size = { width: width, height: height };
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
    var min_width = this.config.min_width || this.canvas.width;

    var crop_size = this.img.width >= min_width ? this.img : {
      width: min_width,
      height: utils.get_height_from_width(min_width, this.image_ratio)
    };

    var crop_scale = utils.scale.bind(undefined,
        crop_size.width / this.image_size.width);
    var crop_window = this.crop_window.map(crop_scale, this);

    var position = {
      x : crop_scale(this.origin.x) - crop_window[0],
      y : crop_scale(this.origin.y) - crop_window[1]
    };

    this.crop_canvas.set_width(crop_window[2] - crop_window[0]);
    this.crop_canvas.set_height(crop_window[3] - crop_window[1]);

    this.crop_canvas[this.rotation_angle ? "rotate_and_draw" : "draw"](
        this._get_transformed_coords(position), this.img, crop_size, this.rotation_angle);

    if (this.text) {
      this.crop_canvas.render_text(this.text, this.distribution, this.alignment, null, crop_scale);
    }

    return this.crop_canvas.el.toDataURL("image/jpeg");
  },

  handle_text_input: function(data) {
    this.text = data;
    this.draw_to_canvas();
  },

  handle_text_action: function(type, value) {
    this[type] = value;
    this.draw_to_canvas();
  },

  reset: function() {
    this._set_common_properties();
    this._perform_zoom();
    this._snap_to_bounds() || this.draw_to_canvas();
  },

  actions : {
    zoomin : function() {
      ++this.zoom_level;
      this._perform_zoom();
    },

    zoomout : function() {
      //if (this.zoom_level <= 0) { return false; }
      --this.zoom_level;
      this._perform_zoom();
    },

    done : function() {
      var image = document.createElement("img");
      image.src = this.crop();
      this.emit("cropped", this.crop());
    },

    rotate : function() {
      this._increment_rotation_angle();
      this.draw_to_canvas({
        x : -(this.image_size.width/2),
        y : -(this.image_size.height/2)
      });
      this.reset();
    },

    "16:9" : function() {
      this._set_aspect_ratio("16:9");
      this.reset();
    },

    "4:3" : function() {
      this._set_aspect_ratio("4:3");
      this.reset();
    },

    "1:1" : function() {
      this._set_aspect_ratio("1:1");
      this.reset();
    },

    orientation : function() {
      this._swap_orientation();
      this.reset();
    },
  }

});
