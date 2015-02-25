(function(document){

  var DEFAULT_TEXT = "Write your headline here";

  this["JST"] = this["JST"] || {};
  
  this["JST"]["src/templates/button.jst"] = function(obj) {
  obj || (obj = {});
  var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
  function print() { __p += __j.call(arguments, '') }
  with (obj) {
  __p += '<div class="croppy__actions">\n  <div class="croppy__zoom croppy__action">\n    <a class="croppy-icon croppy__zoomin js-croppy-btn" data-action="zoomin">zoomin</a>\n    <a class="croppy-icon croppy__zoomout js-croppy-btn" data-action="zoomout">zoomout</a>\n    <span class="croppy__action__label">Zoom</span>\n  </div>\n\n  <div class="croppy__rotate croppy__action">\n    <a class="croppy-icon croppy__rotate js-croppy-btn" data-action="rotate">rotate</a>\n    <span class="croppy__action__label">Rotate</span>\n  </div>\n\n  ';
   if (typeof enable_aspect_ratio !== "undefined" && enable_aspect_ratio) { ;
  __p += '\n  <div class="croppy__zoom croppy__action">\n    <a class="croppy-icon croppy__16-x-9 js-croppy-btn" data-action="16:9">16:9</a>\n    <a class="croppy-icon croppy__4-x-3 js-croppy-btn" data-action="4:3">4:3</a>\n    <a class="croppy-icon croppy__1-x-1 js-croppy-btn" data-action="1:1">1:1</a>\n    <span class="croppy__action__label">Image ratio</span>\n  </div>\n  ';
   } ;
  __p += '\n\n  <div class="croppy__text croppy__action">\n    <a class="croppy-icon croppy__text js-croppy-btn" data-action="text">croppytext</a>\n    <span class="croppy__action__label">Text</span>\n  </div>\n\n  <div class="croppy__save croppy__action">\n    <a class="croppy-icon croppy__done js-croppy-btn" data-action="done">done</a>\n    <span class="croppy__action__label">Save</span>\n  </div>\n</div>\n';
  
  }
  return __p
  };
  
  this["JST"]["src/templates/text.jst"] = function(obj) {
  obj || (obj = {});
  var __t, __p = '', __e = _.escape;
  with (obj) {
  __p += '<div class="croppy-text">\n  <div class="croppy-text__right">\n    <fieldset class="croppy-text__controls">\n      <legend class="croppy-text__label">Alignment</legend>\n        <input class="croppy-text__control" id="croppy_align_left" type="radio" checked name="alignment" value="left" />\n        <label for="croppy_align_left" class="croppy-text__btn">left</label>\n        <input class="croppy-text__control" id="croppy_align_center" type="radio" name="alignment" value="center" />\n        <label for="croppy_align_center" class="croppy-text__btn">center</label>\n        <input class="croppy-text__control" id="croppy_align_right" type="radio" name="alignment" value="right" />\n        <label for="croppy_align_right" class="croppy-text__btn">right</label>\n    </fieldset>\n    <fieldset class="croppy-text__controls">\n      <legend class="croppy-text__label">Distribution</legend>\n        <input class="croppy-text__control" id="croppy_dist_top" type="radio" name="distribution" value="top" />\n        <label for="croppy_dist_top" class="croppy-text__btn">top</label>\n        <input class="croppy-text__control" id="croppy_dist_middle" type="radio" name="distribution" value="middle" />\n        <label for="croppy_dist_middle" class="croppy-text__btn">middle</label>\n        <input class="croppy-text__control" id="croppy_dist_bottom" type="radio" checked name="distribution" value="bottom" />\n        <label for="croppy_dist_bottom" class="croppy-text__btn">bottom</label>\n    </fieldset>\n  </div>\n  <div class="croppy-text__left">\n    <label for="croppy_text_headline" class="croppy-text__label">Headline</label>\n    <textarea id="croppy_text_headline" class="js-croppy-headline">' +
  ((__t = ( default_text )) == null ? '' : __t) +
  '</textarea>\n  </div>\n </div>\n\n';
  
  }
  return __p
  };
  //
  var calculate_aspect_ratio = function(width, height) {
    return height / width;
  };
  
  var get_height_from_width = function(width, aspect_ratio) {
    return Math.round(width * aspect_ratio);
  };
  
  var get_width_from_height = function(height, aspect_ratio) {
    return Math.round(height / aspect_ratio);
  };
  
  var scale = function(scale_factor, num) {
    return Math.round(num * scale_factor);
  };

  var Croppy = function(element, config) {
  
    if (!this._can_cut_the_mustard()) {
      throw "Browser does not cut the mustard - cannot continue";
    }
  
    // set parent dom container
    this._set_el(element);
  
    // override defaults
    this.config = _.extend({width : this.$el.width()}, config);
  
  };
  
  _.extend(Croppy.prototype, Eventable, {
  
    readFromUrl : function(url) {
      this._loadImage(url, true);
    },
  
    readFromFile : function(files) {
  
      var file = files[0];
  
      if (!file.type.match('image.*')) { return; }
  
      var reader = new FileReader();
  
      reader.onload = function(e) {
        this._loadImage(e.target.result)
      }.bind(this);
  
      // Read in the image file as a data URL.
      reader.readAsDataURL(file);
    },
  
    _render : function(img, config) {
      this.ui = new UI(config);
      this.canvas = new InterfaceCanvas(img, config);
      this.$el.append(this.ui.$el, this.canvas.canvas.$el);
      this._addListeners();
    },
  
    _addListeners : function() {
      this.listenTo(this.canvas, "cropped", this.handle_cropped);
      _.forEach(this.ui.items, function(action){
        this.canvas.listenTo(this.ui, "ui:" +  action, this.canvas.actions[action]);
      }, this);
      this.canvas.listenTo(this.ui, "ui:text:input", this.canvas.handle_text_input);
      this.canvas.listenTo(this.ui, "ui:text:action", this.canvas.handle_text_action);
    },
  
    _can_cut_the_mustard : function() {
      if (window.FileReader) {
        return true;
      }
      return false;
    },
  
    _loadImage : function(src, crossOrigin) {
      var img = document.createElement('img');
      crossOrigin && (img.crossOrigin = "anonymous");
      img.onload = function(){
        this._render(img, this.config);
      }.bind(this);
      img.src = src;
    },
  
    _set_el : function(element) {
      if (!element) {
        throw "Parent dom container is not defined";
      }
      this.$el = (element instanceof $) ? element : $(element);
    },
  
    handle_cropped : function(data) {
      this.config.on_crop && this.config.on_crop.call(null, data);
      this.trigger("cropped", data);
    },
  
    detach : function() {
      this.canvas.canvas.$el.detach();
      this.ui.$el.detach();
    },
  
    set_ui_enabled : function(boolean) {
      this.ui.is_enabled = boolean;
    }
  
  });

  var letterbox = {
    horizontal : {
  
      _reset_canvas_height_with_letterbox : function() {
        this.canvas.set_height(this.canvas.get_height() + this.max_mask_size);
      },
  
      _set_image_size : function() {
        this.image_size = {
          width : this.canvas.get_width(),
          height : this.image_size.height
        };
      },
  
      _set_letterbox_coordinates : function() {
        this.letterbox_coordinates = [
          [
            0, 0,
            this.canvas.get_width(), this.half_mask_size
          ],
          [
            0, (this.canvas.get_height() - this.half_mask_size),
            this.canvas.get_width(), this.half_mask_size
          ]
        ];
      },
  
      _set_crop_window_coordinates : function() {
        this.crop_window = [
          0, this.half_mask_size,
          this.canvas.get_width(), (this.canvas.get_height() - this.half_mask_size)
        ];
      }
    },
  
    vertical : {
  
      _reset_canvas_height_with_letterbox : function() {
        this.canvas.set_height(
          get_height_from_width(
            this.canvas.get_width() - this.max_mask_size, this.aspect_ratio
          )
        );
      },
  
      _set_image_size : function() {
        this.image_size = {
          width : get_width_from_height(this.canvas.get_height(), this.image_ratio),
          height : this.canvas.get_height()
        };
      },
  
      _set_letterbox_coordinates : function() {
        this.letterbox_coordinates = [
          [
            0, 0,
            this.half_mask_size, this.canvas.get_height()
          ],
          [
            (this.canvas.get_width() - this.half_mask_size), 0,
            this.half_mask_size, this.canvas.get_height()
          ]
        ];
      },
  
      _set_crop_window_coordinates : function() {
        this.crop_window = [
          this.half_mask_size, 0,
          (this.canvas.get_width() - this.half_mask_size), this.canvas.get_height()
        ];
      }
    },
  
    none : {
      _set_crop_window_coordinates : function() {
        this.crop_window = [
          0, 0, this.canvas.get_width(), this.canvas.get_height()
        ];
      },
  
      _reset_canvas_height_with_letterbox : function() {},
  
      _set_image_size : function() {},
  
      _set_letterbox_coordinates : function() {
        this.letterbox_coordinates = undefined;
      }
    }
  };

  var Canvas = function(config) {
    this.font_family = config.font_family || "Arial";
    this._loadBackground(config.background);
    this._set_el();
    this._set_ctx();
  };
  
  Canvas.prototype = {
  
    _set_el : function() {
      this.$el = $("<canvas>");
      this.el  = this.$el[0];
    },
  
    translate : function(coordinate) {
      this.ctx.translate(coordinate.x, coordinate.y);
    },
  
    _set_ctx : function() {
      this.ctx = this.el.getContext('2d');
    },
  
    set_width_and_height : function(width, aspect_ratio) {
      this.set_width(width),
      this.set_height(get_height_from_width(width, aspect_ratio));
    },
  
    draw : function(position, img, image_size) {
  
      position = position || { x : 0, y : 0 };
  
      // clear the canvas (otherwise we get psychadelic trails)
      this._fill_background();
      // draw the image
      this.ctx.drawImage(
        img,
        position.x,
        position.y,
        image_size.width,
        image_size.height
      );
    },
  
    get_width : function() {
      return this.width;
    },
  
    get_height : function() {
      return this.height;
    },
  
    set_width : function(width) {
      this.width = this.el.width = width;
    },
  
    set_height : function(height) {
      this.height = this.el.height = height;
    },
  
    rotate_and_draw : function(position, img, image_size, rotation) {
      // save the current co-ordinate system
      this.ctx.save();
      this.ctx.translate((image_size.width/2),(image_size.height/2));
      this.ctx.rotate(rotation * Math.PI/180);
      this.ctx.translate(-(image_size.width/2),-(image_size.height/2));
      this.draw(position, img, image_size);
      this.ctx.restore();
    },
  
    _loadBackground: function(background) {
  
      this.background = "rgba(255,255,255,1)";
      if (!background) {return;}
  
      var img = new Image();
      img.crossOrigin = "use-credentials"
      var _this = this;
  
      img.onload = function(){
        // Create a pattern with this image, and set it to "repeat".
        _this.background = _this.ctx.createPattern(img, 'repeat'); 
      }
  
      img.src = background;
    },
  
    _fill_background : function() {
      this.redraw(function(ctx) {
        ctx.fillStyle = this.background;
        ctx.fillRect(0, 0, this.get_width(), this.get_height());
      }, this);
    },
  
    redraw : function(callback, scope) {
      var ctx = this.ctx;
      ctx.save();
      ctx.setTransform(1,0,0,1,0,0);
      callback.call(scope, ctx);
      ctx.restore();
    },
  
    render_overlay: function() {
      this.redraw(function(ctx) {
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this.get_width(), this.get_height());
        ctx.globalAlpha = 1;
      }, this);
    },
  
    calculate_offset: function(dimension, a, b) {
      return Math.round((dimension - ((a - b))) / 2);
    },
  
    render_text: function(text, distribution, alignment, crop_window, scaleFn) {
      this.render_overlay();
      this.redraw(function(ctx) {
  
        var fontSize = scaleFn ? scaleFn(18) : 18;
        var lineHeight = Math.round(fontSize * 1.7)
        var padding = Math.round(fontSize * 1.2);
        var width = this.get_width();
        var height = this.get_height();
        var x_letterbox_offset = crop_window ? this.calculate_offset(width, crop_window[2], crop_window[0]) : 0;
        var y_letterbox_offset = crop_window ? this.calculate_offset(height, crop_window[3], crop_window[1]) : 0;
  
        var maxWidth = Math.round(width - (x_letterbox_offset * 2) - (padding * 2));
        var x = x_letterbox_offset;
        var y = y_letterbox_offset;
  
  
        ctx.font = fontSize + 'pt ' + this.font_family;
        ctx.fillStyle = "#fff";
        ctx.textBaseline = 'middle';
  
        // Text shadow:
        ctx.shadowColor = "#000000";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = scaleFn ? scaleFn(1) : 1;
        ctx.shadowBlur = scaleFn ? scaleFn(1) : 1;
  
        // Text alignment:
        if (alignment === 'center') {
          ctx.textAlign = 'center';
          x = width / 2;
          //maxWidth = width - width / 3;
        } else if (alignment === 'right' ) {
          ctx.textAlign = 'right';
          x = width - x_letterbox_offset - padding;
        } else {
          ctx.textAlign = 'left';
          x = x_letterbox_offset + padding;
        }
  
        var paras = text.split(/\r?\n|\r/g);
  
        paras = paras.map(function(para){
  
          var line  = '';
          var lines = [];
  
          var words = para.split(' ');
  
          for (var n = 0; n < words.length; n++) {
            var testLine  = line + words[n] + ' ';
            var metrics   = ctx.measureText( testLine );
            var testWidth = metrics.width;
  
            if (testWidth > maxWidth && n > 0) {
              lines.push(line.trim());
              line = words[n] + ' ';
            } else {
              line = testLine;
            }
          }
  
          lines.push(line.trim());
          return lines;
        });
  
        var lineBreaks = paras.reduce(function(memo, para){
          return memo + para.length;
        }, -1);
  
        var heightOffset = lineHeight * (lineBreaks);
  
        if (distribution === 'top') {
          y = y_letterbox_offset + (padding + (lineHeight/2));
        } else if (distribution === 'middle'){
          y = Math.round((height - heightOffset) / 2);
        } else {
          y = height - y_letterbox_offset - (padding + (lineHeight/2)) - heightOffset;
        }
  
        paras.forEach(function(para, i){
          para.forEach(function(line){
            ctx.fillText(line, x, y);
            y += lineHeight;
          });
        });
  
        ctx.shadowColor = 'transparent';
      }, this);
    }
  };

  var InterfaceCanvas = function(img, config) {
  
    this.config = _.extend(this.config, config);
  
    window.croppy = this;
  
    this.zoom_level = 0;
    this.rotation_angle = 0;
  
    this._set_img(img);
    this._set_orientation_from_config();
  
    this._set_canvas();
  
    this._set_aspect_ratio(this.config.aspect_ratio);
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
  
      this.letterbox = letterbox.none;
      this._init_letterbox(0, 0);
  
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
          height = get_height_from_width(width, this.image_ratio);
  
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
        height: get_height_from_width(min_width, this.image_ratio)
      };
  
      var crop_scale = _.partial(scale, crop_size.width / this.image_size.width);
      var crop_window = _.map(this.crop_window, crop_scale, this);
  
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
        this.trigger("cropped", this.crop());
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

  var UI = function(config) {
    this.config = config || {};
    this.createEl();
    this.render();
    this.delegateEvents();
  };
  
  UI.fn = _.extend(UI.prototype, Eventable, {
  
    is_enabled : true,
  
    delegateEvents: function() {
      this.$el.on("click", ".js-croppy-btn", this.dispatch_event.bind(this));
      this.$el.on("keyup", ".js-croppy-headline", this.dispatch_text.bind(this));
      this.$el.on("change", ".croppy-text__control", this.dispatch_text_button.bind(this));
    },
  
    items : ["zoomin", "zoomout", "done", "rotate", "orientation", "text", "16:9", "4:3", "1:1"],
  
    createEl : function() {
      this.$el = $('<div>', {"class": "croppy__ui"});
    },
  
    render : function() {
      this.$el.html(JST["src/templates/button.jst"](this.config.ui));
      return this;
    },
  
    dispatch_text: function(e) {
      this.trigger("ui:text:input", e && e.target.value);
    },
  
    dispatch_text_button: function(e) {
      this.trigger("ui:text:action", e.target.name, e.target.value);
    },
  
    dispatch_event : function(e) {
      var action = e.target.dataset.action;
      if (this.is_enabled) {
        this.trigger("ui:" + action);
      }
      if (action === "text") {
        this.toggle_text_ui();
      }
    },
  
    toggle_text_ui: function() {
      var text_ui = this.$el.find(".croppy-text");
      if (text_ui.length) {
        this.dispatch_text();
        text_ui.remove();
      } else {
        this.$el.append(JST["src/templates/text.jst"]({default_text: DEFAULT_TEXT}));
        this.dispatch_text({target:{value:DEFAULT_TEXT}});
      }
    },
  
    remove : function() {
      this.$el.undelegate().remove();
    }
  });

  window.Croppy = Croppy;

})(document);