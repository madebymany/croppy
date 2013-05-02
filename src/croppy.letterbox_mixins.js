var letterbox = {
  horizontal : {

    _reset_canvas_height_with_letterbox : function() {
      this.el.height = this.canvas_size.height += this.max_mask_size;
    },

    _set_image_size : function() {
      this.image_size = {
        width : this.canvas_size.width,
        height : this.image_size.height
      };
    },

    _set_letterbox_coordinates : function() {
      this.letterbox_coordinates = [
        [0, 0, this.image_size.width, this.half_mask_size],
        [0, (this.canvas_size.height - this.half_mask_size), this.image_size.width, this.half_mask_size]
      ];
    },

    _set_crop_window_coordinates : function() {
      this.crop_window = [
        0, this.half_mask_size, this.canvas_size.width, (this.canvas_size.height - this.half_mask_size)
      ];
    }
  },

  vertical : {

    _reset_canvas_height_with_letterbox : function() {
      this.el.height = this.canvas_size.height =
        this.get_height_from_width(this.canvas_size.width - this.max_mask_size, this.aspect_ratio);
    },

    _set_image_size : function() {
      this.image_size = {
        width : this.get_width_from_height(this.canvas_size.height, this.image_ratio),
        height : this.canvas_size.height
      };
    },

    _set_letterbox_coordinates : function() {
      this.letterbox_coordinates = [
        [0, 0, this.half_mask_size, this.image_size.height],
        [(this.canvas_size.width - this.half_mask_size), 0, this.half_mask_size, this.image_size.height]
      ];
    },

    _set_crop_window_coordinates : function() {
      this.crop_window = [
        this.half_mask_size, 0, (this.canvas_size.width - this.half_mask_size), this.canvas_size.height
      ];
    }
  },

  none : {
    _set_crop_window_coordinates : function() {
      this.crop_window = [
        0, 0, this.canvas_size.width, this.canvas_size.height
      ];
    },

    _set_image_size : function() {
      this.image_size = this._return_raw_image_size();
    }
  }
};
