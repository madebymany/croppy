// Constructor
var Croppy = function(files, config) {

  if (!this._can_cut_the_mustard()) {
    throw "Browser does not cut the mustard - cannot continue";
  }

  // override defaults
  extend(this.config, config);

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
    // ui_dimensions : {
    //   width : 1000,
    //   height : 1000
    // },
    // min_dimensions : {
    //   width : 1000,
    //   height : 1000
    // },
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