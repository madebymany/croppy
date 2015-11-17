var Canvas = function(config) {
  this.font_family = config.font_family || "Arial";
  this._loadBackground(config.background);
  this._set_el();
  this._set_ctx();
};

Canvas.prototype = {

  _set_el : function() {
    this.el = document.createElement('canvas');
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

  rotate_and_draw : function(position, img, image_size, rotation) {
    // save the current co-ordinate system
    this.ctx.save();
    this.ctx.translate((image_size.width/2),(image_size.height/2));
    this.ctx.rotate(rotation * Math.PI/180);
    this.ctx.translate(-(image_size.width/2),-(image_size.height/2));
    this.draw(position, img, image_size);
    this.ctx.restore();
  },

  _loadBackground: function(background) {

    this.background = "rgba(255,255,255,1)";
    if (!background) {return;}

    var img = new Image();
    img.crossOrigin = "use-credentials"
    var _this = this;

    img.onload = function(){
      // Create a pattern with this image, and set it to "repeat".
      _this.background = _this.ctx.createPattern(img, 'repeat'); 
    }

    img.src = background;
  },

  _fill_background : function() {
    this.redraw(function(ctx) {
      ctx.fillStyle = this.background;
      ctx.fillRect(0, 0, this.get_width(), this.get_height());
    }, this);
  },

  redraw : function(callback, scope) {
    var ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    callback.call(scope, ctx);
    ctx.restore();
  },

  render_overlay: function() {
    this.redraw(function(ctx) {
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, this.get_width(), this.get_height());
      ctx.globalAlpha = 1;
    }, this);
  },

  calculate_offset: function(dimension, a, b) {
    return Math.round((dimension - ((a - b))) / 2);
  },

  render_text: function(text, distribution, alignment, crop_window, scaleFn) {
    this.render_overlay();
    this.redraw(function(ctx) {

      var fontSize = scaleFn ? scaleFn(18) : 18;
      var lineHeight = Math.round(fontSize * 1.7)
      var padding = Math.round(fontSize * 1.2);
      var width = this.get_width();
      var height = this.get_height();
      var x_letterbox_offset = crop_window ? this.calculate_offset(width, crop_window[2], crop_window[0]) : 0;
      var y_letterbox_offset = crop_window ? this.calculate_offset(height, crop_window[3], crop_window[1]) : 0;

      var maxWidth = Math.round(width - (x_letterbox_offset * 2) - (padding * 2));
      var x = x_letterbox_offset;
      var y = y_letterbox_offset;


      ctx.font = fontSize + 'pt ' + this.font_family;
      ctx.fillStyle = "#fff";
      ctx.textBaseline = 'middle';

      // Text shadow:
      ctx.shadowColor = "#000000";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = scaleFn ? scaleFn(1) : 1;
      ctx.shadowBlur = scaleFn ? scaleFn(1) : 1;

      // Text alignment:
      if (alignment === 'center') {
        ctx.textAlign = 'center';
        x = width / 2;
        //maxWidth = width - width / 3;
      } else if (alignment === 'right' ) {
        ctx.textAlign = 'right';
        x = width - x_letterbox_offset - padding;
      } else {
        ctx.textAlign = 'left';
        x = x_letterbox_offset + padding;
      }

      var paras = text.split(/\r?\n|\r/g);

      paras = paras.map(function(para){

        var line  = '';
        var lines = [];

        var words = para.split(' ');

        for (var n = 0; n < words.length; n++) {
          var testLine  = line + words[n] + ' ';
          var metrics   = ctx.measureText( testLine );
          var testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }

        lines.push(line.trim());
        return lines;
      });

      var lineBreaks = paras.reduce(function(memo, para){
        return memo + para.length;
      }, -1);

      var heightOffset = lineHeight * (lineBreaks);

      if (distribution === 'top') {
        y = y_letterbox_offset + (padding + (lineHeight/2));
      } else if (distribution === 'middle'){
        y = Math.round((height - heightOffset) / 2);
      } else {
        y = height - y_letterbox_offset - (padding + (lineHeight/2)) - heightOffset;
      }

      paras.forEach(function(para, i){
        para.forEach(function(line){
          ctx.fillText(line, x, y);
          y += lineHeight;
        });
      });

      ctx.shadowColor = 'transparent';
    }, this);
  }
};
