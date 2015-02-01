var Canvas = function() {
  this._set_el();
  this._set_ctx();
};

Canvas.prototype = {

  _set_el : function() {
    this.$el = $("<canvas>");
    this.el  = this.$el[0];
  },

  translate : function(coordinate) {
    this.ctx.translate(coordinate.x, coordinate.y);
  },

  _set_ctx : function() {
    this.ctx = this.el.getContext('2d');
  },

  set_width_and_height : function(width, aspect_ratio) {
    this.set_width(width),
    this.set_height(get_height_from_width(width, aspect_ratio));
  },

  draw : function(position, img, image_size) {

    position = position || { x : 0, y : 0 };

    // clear the canvas (otherwise we get psychadelic trails)
    this._fill_background();
    // draw the image
    this.ctx.drawImage(
      img,
      position.x,
      position.y,
      image_size.width,
      image_size.height
    );
  },

  get_width : function() {
    return this.width;
  },

  get_height : function() {
    return this.height;
  },

  set_width : function(width) {
    this.width = this.el.width = width;
  },

  set_height : function(height) {
    this.height = this.el.height = height;
  },

  rotate_and_draw : function(position, img, image_size, rotation_angle) {
    // save the current co-ordinate system
    this.ctx.save();
    // move to the middle of where we want to draw our image
    this.ctx.translate((image_size.width/2),(image_size.height/2));
    // rotate around that point, converting our
    // angle from degrees to radians
    this.ctx.rotate(rotation_angle * Math.PI/180);
    // draw it up and to the left by half the width
    // and height of the image

    position = {
      x : position.x - (image_size.width/2),
      y : position.y - (image_size.height/2)
    };

    this.draw(position, img, image_size);
    // and restore the co-ords to how they were when we began
    this.ctx.restore();
  },

  _fill_background : function() {
    this.redraw(function(ctx) {
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.fillRect(0, 0, this.get_width(), this.get_height());
    }, this);
  },

  redraw : function(callback, scope) {
    var ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    callback.call(scope, ctx);
    ctx.restore();
  }

};
