var Croppy = function(element, config) {

  if (!this._can_cut_the_mustard()) {
    throw "Browser does not cut the mustard - cannot continue";
  }

  // set parent dom container
  this._set_el(element);

  // override defaults
  this.config = Object.assign({width : this.$el.clientWidth}, config);

};

Object.assign(Croppy.prototype, Eventable, {

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
    this.$el.appendChild(this.ui.$el);
    this.$el.appendChild(this.canvas.canvas.$el);
    this._addListeners();
  },

  _addListeners : function() {
    this.listenTo(this.canvas, "cropped", this.handle_cropped);
    this.ui.items.forEach(function(action){
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
    this.$el = element;
  },

  handle_cropped : function(data) {
    this.config.on_crop && this.config.on_crop.call(null, data);
    this.trigger("cropped", data);
  },

  detach : function() {
    [this.canvas.canvas.$el, this.ui.$el].forEach(function (e) {
      e.parentNode.removeChild(e);
    });
  },

  set_ui_enabled : function(boolean) {
    this.ui.is_enabled = boolean;
  }

});
