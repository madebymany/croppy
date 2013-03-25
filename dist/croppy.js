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
  
  var executeRecursive = function(method, argsList, context) {
    argsList.forEach(function(args){
      method[Array.isArray(args) ? "apply" : "call"](context, args);
    });
  };
  
  var create = function(protoProps, staticProps) {
  
    var parent = this;
    var child = function(){ parent.apply(this, arguments); };
  
    // Add static properties to the constructor function, if supplied.
    extend(child, parent, staticProps);
  
    // Set the prototype chain to inherit from `parent`
    child.prototype = Object.create(parent.prototype);
  
    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
      extend(child.prototype, protoProps);
    }
  
    return child;
  };
  
  var isArray = function (obj) {
    return obj && obj.constructor == Array;
  };
  
  
  
  
  
  

  // Constructor
  var Croppy = function(files, config) {
  
    if (!this._can_cut_the_mustard()) {
      throw "Browser does not cut the mustard - cannot continue";
    }
  
    // override defaults
    extend(this.config, config);
  
    // if set, convert aspect ratio to floating point number
    this._set_config_aspect_ratio(this.config.aspect_ratio);
  
    // set parent dom container
    this._set_config_dom_container(this.config.dom_container);
  
    // create new Image object with instance config options from Image pototype
    this.Image = Image.create(this.config);
  
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
  
    /**
     * Default config options
     */
    config : {
      ui_dimensions : {
        width : 1000,
        height : 1000
      },
      min_dimensions : {
        width : 1000,
        height : 1000
      },
      // optional
      aspect_ratio : '16:9',
      max_letterbox_height : 40,
      dom_container : "preview"
    },
  
    /**
     * Public list of image instances
     */
    imageList : [],
  
    /**
     * sets the dom container - the parent that all dom objects are appended to
     *
     * @param {String || Node} id of node or node itself
     * @return {Node}
     * @api private
     */
    _set_config_dom_container : function(dom_container) {
  
      if (typeof dom_container === "string") {
        dom_container = document.getElementById(dom_container);
      }
  
      if (!dom_container || dom_container.nodeType !== 1) {
        throw "Parent dom container is not defined";
      }
  
      return this.config.dom_container = dom_container;
    },
  
    /**
     * determine the aspect ratio
     *
     * ### Examples:
     *
     *     instance.set_aspect_ratio('16:9');
     *     // => '0.5625'
     *
     * @param {String} string aspect ratio representation
     * @return {Number} floating point number used to determine aspect ratio
     * @api private
     */
  
    _set_config_aspect_ratio : function(aspect_ratio) {
  
      // if aspect natio is null or undefined (note ==)
      if (aspect_ratio == null) {
        return false;
      }
  
      // assume aspect ratio is precalculated if not provided as a string
      if (aspect_ratio && typeof aspect_ratio === "string") {
        aspect_ratio = aspect_ratio.split(":");
        aspect_ratio = {
          width : parseInt(aspect_ratio[0], 10),
          height : parseInt(aspect_ratio[1], 10)
        };
      }
  
      return this.config.aspect_ratio = aspect_ratio;
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
        // this.imageList.push(new this.Image(img));
        console.log(new this.Image(img));
      }.bind(this);
    }
  
  };

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
  
    var ui = new UI();
  
    ui.appendChild(this.canvas.get_canvas_el());
  
    this.dom_container.appendChild(ui);
  
    return this;
  
  };
  
  Image.prototype = {
  
    _set_orientaion : function() {
      if (this.aspect_ratio.width >= this.aspect_ratio.height) {
        return this.orientation = "landscape";
      }
      return this.orientation = "portrait";
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

  var UI = function() {
  
    // create a parent wrapper for the canvas
    var parent = this.createElement("div", {
      "class" : "croppy__parent"
    });
  
    // create zoom interface buttons
    var html = this.createElements(this.elements);
  
    parent.appendChild(html);
  
    return parent;
  
    // parent.className = "crop-parent";
    // parent.style.width = editorWidth + "px";
  
    // // add the parent to the canvas object
    // canvas.parent = parent;
  
    // // main initialisation function
    // this.start(canvas);
  
    // // wrap the canvas in the parent
    // parent.appendChild(canvas.canvas);
  
    // // place the parent in the dom
    // preview.appendChild(parent);
  
    // // for debug purposes
    // //preview.appendChild(this.cropCanvas.canvas);
  
  };
  
  UI.prototype = UI.fn = {
  
    elements : [
      ["a", { "class" : "croppy__zoom-in",  "text" : "+" }],
      ["a", { "class" : "croppy__zoom-out", "text" : "-" }],
      ["a", { "class" : "croppy__crop",     "text" : "crop" }],
      ["a", { "class" : "croppy__reset",    "text" : "reset" }],
      ["a", { "class" : "croppy__change",   "text" : "change" }]
    ],
  
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
        delete attributes.text;
      }
  
      for (var attribute in attributes) {
        if (!attributes.hasOwnProperty(attribute) || attribute === "events") {continue;}
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
  
  };

  Image.create = create;

  window.Croppy = Croppy;

})(document);