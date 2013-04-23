(function(document){

  // shallow copy of one object to another
  
  var extend = function(base) {
  
    var args = [].splice.call(arguments, 1);
  
    [].forEach.call(args, function(obj){
  
      // purposefully using == to compare null || undefined
      if (obj == null) {
        return;
      }
  
      for (var o in obj) {
        if (obj.hasOwnProperty(o)) {
          base[o] = obj[o];
        }
      }
  
    });
  
    return base;
  };
  
  var isArray = function (obj) {
    return obj && obj.constructor == Array;
  };
  
  
  
  
  
  

  var CroppyDom = Object.create({
  
    removeElement : function(el) {
      // el.removeEventListener();
      el.parentNode.removeChild(el);
    },
  
    addEventListeners : function(el, events, useCapture) {
  
      if (typeof events === "undefined") { return el; }
  
      for (var event in events) {
        if (!events.hasOwnProperty(event)) {continue;}
        el.addEventListener(event, events[event], useCapture);
      }
  
      return el;
    },
  
    setAttributes : function(el, attributes) {
  
      if (typeof attributes.text !== "undefined") {
        el.textContent = attributes.text;
      }
  
      for (var attribute in attributes) {
        if (!attributes.hasOwnProperty(attribute) || attribute === "events" || attribute === "text") {continue;}
        el.setAttribute(attribute, attributes[attribute]);
      }
  
      return el;
    },
  
    createElements : function(argsList){
      var fragment = document.createDocumentFragment();
      argsList.forEach(function(args){
        fragment.appendChild(this.createElement.apply(this, args));
      }, this);
      return fragment;
    },
  
    createElement : function(el, attributes, events) {
  
      el = document.createElement(el);
  
      if (arguments.length === 1) {
        return el;
      }
  
      if (typeof attributes === "string") {
        el.textContent = attributes;
      } else {
        this.setAttributes(el, attributes, events);
      }
  
      this.addEventListeners(el, extend(events || {}, attributes.events), false);
  
      return el;
    }
  });

  // Constructor
  var Croppy = function(files, dom_container, config) {
  
    if (!this._can_cut_the_mustard()) {
      throw "Browser does not cut the mustard - cannot continue";
    }
  
    // set parent dom container
    this._set_dom_container(dom_container);
  
    // override defaults
    this.config = extend({width : this.dom_container.offsetWidth}, config);
  
    // Loop through the FileList and render image files as thumbnails.
    [].forEach.call(files, function(file) {
      if (file.type.match('image.*')) {
        this._readFile(file);
      }
    }, this);
  
  };
  
  Croppy.prototype = {
  
    _can_cut_the_mustard : function() {
      if (window.FileReader) {
        return true;
      }
      return false;
    },
  
    imageList : [],
  
    _set_dom_container : function(dom_container) {
  
      if (typeof dom_container === "string") {
        dom_container = document.getElementById(dom_container);
      }
  
      if (!dom_container || dom_container.nodeType !== 1) {
        throw "Parent dom container is not defined";
      }
  
      this.dom_container = dom_container;
    },
  
    _readFile : function(file) {
  
      if (!window.FileReader) { throw "Browser does not support fileReader - cannot continue"; }
  
      var reader = new FileReader();
  
      reader.onload = this._onFileLoaded.bind(this);
      // Read in the image file as a data URL.
      reader.readAsDataURL(file);
    },
  
    _onFileLoaded : function(e) {
      var img = document.createElement('img');
      img.src = e.target.result;
  
      img.onload = function(){
        this.dom_container.appendChild(new UI());
        this.dom_container.appendChild(new Canvas(img, this.config));
      }.bind(this);
    }
  
  };

  var with_horizontal_letterbox = {
  
    _reset_image_size_with_letterbox : function() {
      this._set_mask_size(this.image_size.height, this.canvas_el.height);
      this.canvas_el.height += this.max_mask_size;
      this.image_size = {
        width : this.canvas_el.width,
        height : this.image_size.height
      };
    },
  
    _set_letterbox_coordinates : function() {
      this.letterbox_coordinates = [
        [0, 0, this.image_size.width, this.max_mask_size],
        [0, (this.canvas_el.height - this.max_mask_size), this.image_size.width, this.max_mask_size]
      ];
    },
  
    _set_crop_window_coordinates : function() {
      this.crop_window = [
        0, this.max_mask_size, this.canvas_el.width, (this.canvas_el.height - this.max_mask_size)
      ];
    }
  };
  
  var with_vertical_letterbox = {
  
    _reset_image_size_with_letterbox : function() {
      this._set_mask_size(this.image_size.width, this.canvas_el.width);
      var height = this.canvas_el.height = this.get_height_from_width(this.canvas_el.width - this.max_mask_size, this.aspect_ratio);
      this.image_size = {
        width : this.get_width_from_height(height, this.image_ratio),
        height : height
      };
    },
  
    _set_letterbox_coordinates : function() {
      this.letterbox_coordinates = [
        [0, 0, this.max_mask_size, this.image_size.height],
        [(this.canvas_el.width - this.max_mask_size), 0, this.max_mask_size, this.image_size.height]
      ];
    },
  
    _set_crop_window_coordinates : function() {
      this.crop_window = [
        this.max_mask_size, 0, (this.canvas_el.width - this.max_mask_size), this.canvas_el.height
      ];
    }
  };

  var Canvas = function(img, config) {
  
    this.config = extend(this.config, config);
    this.max_mask_size = this.config.max_mask_size;
  
    this._set_img(img);
    this._set_canvas_el(this.config.width, this.aspect_ratio_to_float(this.config.aspect_ratio));
  
    this._set_raw_image_size();
    this._set_letterbox_mixin();
  
    this._set_ctx();
    this._set_coordinate("origin");
    this._set_mouse_events("on");
    this.draw(this.origin);
  
    return this.canvas_el;
  };
  
  Canvas.prototype = {
  
    config : {
      aspect_ratio : '16:9',
      max_mask_size : 160
    },
  
    _set_letterbox_mixin : function() {
      if (this.image_size.width < this.canvas_el.width) {
        extend(this, with_horizontal_letterbox);
        this._init_letterbox();
        return;
      }
  
      if (this.image_size.height < this.canvas_el.height) {
        extend(this, with_vertical_letterbox);
        this._init_letterbox();
        return;
      }
  
      // no letterbox - image is already at the correct aspect ratio
      this._set_crop_window_coordinates();
    },
  
    _init_letterbox : function() {
      this._reset_image_size_with_letterbox();
      this._set_half_mask_size();
      this._set_letterbox_coordinates();
      this._set_crop_window_coordinates();
    },
  
    _set_crop_window_coordinates : function() {
      this.crop_window = [
        0, 0, this.canvas_el.width, this.canvas_el.height
      ];
    },
  
    _set_raw_image_size : function() {
      this.image_ratio = this.calculate_aspect_ratio(this.img.width, this.img.height);
      this.image_size = {
        height : this.get_height_from_width(this.canvas_el.width, this.image_ratio),
        width  : this.get_width_from_height(this.canvas_el.height, this.image_ratio)
      };
    },
  
    _set_mask_size : function(image_size, canvas_size) {
      var mask_size = (image_size - canvas_size);
      this.max_mask_size = (mask_size > this.max_mask_size) ? this.max_mask_size : mask_size;
    },
  
    _set_half_mask_size : function() {
      this.max_mask_size = Math.round(this.max_mask_size / 2);
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
  
    _set_ctx : function() {
      this.ctx = this.canvas_el.getContext('2d');
    },
  
    _set_canvas_el : function(width, aspect_ratio) {
      return this.canvas_el = CroppyDom.createElement("canvas", {
        width : width,
        height : this.get_height_from_width(width, aspect_ratio)
      });
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
      (el || this.canvas_el)
        .addEventListener(event, (callback || this), false);
    },
  
    // convenience function for removing event listeners from the canvas
    off : function(event, el, callback) {
      (el || this.canvas_el)
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
  
      this._draw_letter_box(this.letterbox_coordinates);
    },
  
    // this is the letterbox that appears at the top and bottom
    // of the image in the editor. Needs to be redrawn every time
    // the canvas is redrawn
    _draw_letter_box : function(mask) {
  
      // if the letterbox_coordinates don't exist redefine this function as a noop
      if (!mask) {
        this._draw_letter_box = function(){};
        return;
      }
  
      // otherwise redefine the function
      this._draw_letter_box = function(mask) {
        this._redraw_canvas(function(ctx) {
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect.apply(ctx, mask[0]);
          ctx.fillRect.apply(ctx, mask[1]);
        });
      };
  
      this._draw_letter_box(mask);
    },
  
    _fill_background : function() {
      var canvas = this.canvas_el;
      this._redraw_canvas(function(ctx) {
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
      if (correction.x === 0 && correction.y === 0) { return; }
  
      // redraw the image in the correct position
      this.draw(correction);
      // set the translate origin to the new position
      this._update_translate_origin(correction);
    }
  };

  var UI = function() {
  
    // create a parent wrapper for the canvas
    var parent = CroppyDom.createElement("div", {
      "class" : "croppy__parent"
    });
  
    // create interface buttons
    console.log(this.elements);
    var html = CroppyDom.createElements(this.elements);
  
    parent.appendChild(html);
  
    return parent;
  
  };
  
  UI.prototype = UI.fn = {
  
    elements : [
      ["a", {
        "class" : "croppy-icon croppy__zoom-in",
        "text" : "zoomin",
        "events": {
          "click" : "boom"
        }
      }],
      ["a", { "class" : "croppy-icon croppy__zoom-out", "text" : "zoomout" }],
      ["a", { "class" : "croppy-icon croppy__crop",     "text" : "done" }],
      ["a", { "class" : "croppy-icon croppy__reset",    "text" : "redo" }],
      ["a", { "class" : "croppy-icon croppy__change",   "text" : "new" }]
    ],
  
    boom : function() {
      alert("lol");
    }
  
  };

  window.Croppy = Croppy;

})(document);