var with_horizontal_letterbox = {

  _reset_image_size_with_letterbox : function() {
    this._set_mask_size(this.image_size.height, this.canvas_size.height);
    this.canvas_size.height += this.max_mask_size;
    this.image_size = {
      width : this.canvas_size.width,
      height : this.image_size.height
    };
  },

  _set_letterbox_coordinates : function() {
    this.letterbox_coordinates = [
      [0, 0, this.image_size.width, this.max_mask_size],
      [0, (this.canvas_size.height - this.max_mask_size), this.image_size.width, this.max_mask_size]
    ];
  },

  _set_crop_window_coordinates : function() {
    this.crop_window = [
      0, this.max_mask_size, this.canvas_size.width, (this.canvas_size.height - this.max_mask_size)
    ];
  }
};

var with_vertical_letterbox = {

  _reset_image_size_with_letterbox : function() {
    this._set_mask_size(this.image_size.width, this.canvas_size.width);
    var height = this.canvas_size.height = this.get_height_from_width(this.canvas_size.width - this.max_mask_size, this.aspect_ratio);
    this.image_size = {
      width : this.get_width_from_height(height, this.image_ratio),
      height : height
    };
  },

  _set_letterbox_coordinates : function() {
    this.letterbox_coordinates = [
      [0, 0, this.max_mask_size, this.image_size.height],
      [(this.canvas_size.width - this.max_mask_size), 0, this.max_mask_size, this.image_size.height]
    ];
  },

  _set_crop_window_coordinates : function() {
    this.crop_window = [
      this.max_mask_size, 0, (this.canvas_size.width - this.max_mask_size), this.canvas_size.height
    ];
  }
};