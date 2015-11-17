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
