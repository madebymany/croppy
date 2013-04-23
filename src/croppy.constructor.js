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