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
    this._loadImage(url);
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
    this.ui = new UI();
    this.canvas = new InterfaceCanvas(img, config);
    this.$el.append(this.ui.$el, this.canvas.canvas.$el);
    this._addListeners();
  },

  _addListeners : function() {
    this.listenTo(this.canvas, "cropped", this.handle_cropped);
    _.forEach(this.ui.items, function(action){
      this.canvas.listenTo(this.ui, "ui:" +  action, this.canvas.actions[action]);
    }, this);
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