// Constructor
var Croppy = function(files, element, config) {

  this.instances = [];

  if (!this._can_cut_the_mustard()) {
    throw "Browser does not cut the mustard - cannot continue";
  }

  // set parent dom container
  this._set_el(element);

  // override defaults
  this.config = _.extend({width : this.$el.width()}, config);

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
      var instance = new Wrapper(img, this.config);
      this.$el.append(instance.$el);
      this.instances.push(instance);
    }.bind(this);
  },

  _set_el : function(element) {
    if (!element) {
      throw "Parent dom container is not defined";
    }
    this.$el = (element instanceof $) ? element : $(element);
  }

};