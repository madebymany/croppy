(function(document, window){
  
  // Constructor
  var CroppingTool = function(img, config) {
    
    
    var config = config || {},
        preview = config.preview || document.querySelector("#preview");
    
    // Smallest width (visible canvas area)
    this.editorWidth = config.editorWidth || 580;
    
    // Max width available for whole site - no image on the site will ever have to be bigger than this
    var transmitWidth = config.maxWidth || 1000,
        // this is the min height of the image based on 
        transmitHeight = ~~(0.5625 * transmitWidth);
        
    this.transmitScale = { x : transmitWidth, y : transmitHeight };
    
    // what percentage of image width is transmit width?
    var percentage = (transmitWidth / img.width) * 100;
    
    // the image is too small
    if (percentage > 100 || this.scale(transmitWidth, img, true).height < ~~(0.5625 * transmitWidth)) { 
      console.log("image is too small");
      return false; 
    }
        
    // Largest width possible so that max zoom level does not exceed max available for the whole site (transmitWidth)
    this.maxWidth = (this.editorWidth * 100) / percentage;
    
    // Panning state
    this.isPanning = false;
    
    // main initialisation function
    this.init(img, this.editorWidth);
  
    var canvas = this.canvas;
    
    // amount to resize the image by when zooming in and out
    this.resizeAmt = (this.maxWidth * 10) / 100;
  
    preview.appendChild(canvas);
  
    // create zoom interface buttons
    this.createUIElement(canvas, preview, "zoomin", "+");
    this.createUIElement(canvas, preview, "zoomout", "-");
    
    this.createUIElement(canvas, preview, "crop", "crop");
  };
  
  CroppingTool.prototype = {
    
    // Refernced by this when using aaddEventListener
    // Allows us to persist CroppingTool scope in callbacks
    handleEvent : function(e) {
      switch(e.type) {
        case "mousedown": this.mousedown(e); break;
        case "mousemove": this.mousemove(e); break;
        case "mouseup": this.mouseup(e); break;
        case "click": 
          if (e.target.dataset.ui === "crop") {
            this.cropImage();
          } else {
            this.zoomClick(e, this.resizeAmt); 
          }
        break;
        case "wheel": case "scroll": case "mousewheel": this.zoomClick(e, 5); break;
      }
    },
    
    // Calculate scale for resizing the image
    scale : function(max, obj, limit) {

      var width = obj.width, 
          height = obj.height,
          scale = Math.min(
            (max) / width,
            height
          );
      
      scale = (limit && scale > 1) ? 1 : scale;

      return {
        width : parseInt(width * scale, 10),
        height : parseInt(height * scale, 10)
      };
    },
    
    createCanvas : function(width, height) {
      var canvas = document.createElement("canvas");
      
      canvas.width = width;
      canvas.height = height;
      
      return canvas;
    },
    
    init : function(img) {

      var editorWidth = this.editorWidth,
          minEditorHeight = ~~(0.5625 * this.editorWidth), 
          scale = this.scale,
          scaleImg = scale(editorWidth, img, true);
      
      // this is what the user sees
      var canvas = this.createCanvas(scaleImg.width, scaleImg.height);
      
      // this is what performs the actual crop
      var cropCanvas = this.createCanvas(scaleImg.width, scaleImg.height);

      canvas.addEventListener("mousedown", this, false);
      canvas.addEventListener("mousemove", this, false);
      canvas.addEventListener("mouseup", this, false);
      canvas.addEventListener("wheel", this, false);
      canvas.addEventListener("scroll", this, false);
      canvas.addEventListener("mousewheel", this, false);

      var ctx = canvas.getContext('2d');
      
      this.img = img;
      this.canvas = canvas;
      this.ctx = ctx;
      this.scaleImg = scaleImg;
      this.origin = { x : 0, y : 0 };
      
      this.maskHeight = (canvas.height - minEditorHeight) / 2;
      this.maskOffset = minEditorHeight + this.maskHeight;
      this.minHeight = minEditorHeight;
      
      this.drawImage(img);
      
      return true;
    },
    
    // this is the letterbox that appears at the top and bottom of the image in the editor.
    // needs to be redrawn everytime the canvas is redrawn
    // 
    letterBox : function(ctx) {
      
      var editorWidth = this.editorWidth,
          maskHeight = this.maskHeight;
      
      ctx.save();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.fillStyle = "rgba(255,0,0,0.5)";
      ctx.fillRect(0, 0, editorWidth, maskHeight);
      ctx.fillRect(0, this.maskOffset, editorWidth, maskHeight);
      ctx.restore();
    },
    
    position : function(e) {

      // check which property we're looking for - but only do it once

      if (e.hasOwnProperty("layerX")) { // Firefox

        this.position = function(e) {
          return {
            x : e.layerX,
            y : e.layerY
          };
        };

      } else if (e.hasOwnProperty("offsetX")) { // Opera

        this.position = function(e) {
          return {
            x : e.offsetX,
            y : e.offsetY
          };
        };

      }

      return this.position(e);
    },
    
    createUIElement : function(canvas, parent, name, text) {
      
      // function for creating plus and minus buttons - might make this a static method 
      var el = document.createElement("a");
      
      el.textContent = text;
      el.className = el.dataset.ui = name;
      el.addEventListener("click", this, false);
      
      parent.insertBefore(el, canvas);
      
      this["name"] = el;
    },
    
    zoomClick : function(e, amt) {
      var amt = amt || 1,
          target = e.target,
          scaleImg = this.scaleImg,
          offset = scaleImg.width,
          wheel = e.wheelDeltaY || false;
          
      e.preventDefault();
      
      // Increment or decrement depending on the button pushed or direction of the scroll wheel
      offset += (target.dataset.ui === "zoomin" || (wheel && wheel > 0)) ? amt : -amt;
      
      console.log(offset, target.dataset.ui, amt, this.maxWidth, this.editorWidth)
      
      if (offset > this.maxWidth) {
        console.log("cannot go larger than this");
        offset = this.maxWidth;
      } else if (offset < this.editorWidth) {
        console.log("cannot go smaller than this");
        offset = this.editorWidth;
      }
      
      // scale the image based on the offset which is current width +/- amt
      var newSize = this.scale(offset, scaleImg);
      
      this.scaleImg = newSize;
      
      // offset the image by the inverse of half the difference between the old width and height and the new width and height
      // this will make it look like we're resizing from the center
      this.move = { x : ~~(((newSize.width - scaleImg.width) / 2) * -1), y : ~~(((newSize.height - scaleImg.height) / 2) * -1) };
      
      // no need to specify origin as it has already been reset
      this.drawImage(this.img, this.move);
      this.checkBounds();
    },
    
    mousedown : function(e) {
      this.isPanning = true;
      // cache the start position
      this.postStart = this.position(e);
    },
    
    mousemove : function(e) {

      if (!this.isPanning) { return; }
        
      var pos = this.position(e),
          posStart = this.postStart,
          move = this.move = { x : (pos.x - posStart.x), y : (pos.y - posStart.y) };
      
      // move the image by the difference between the cached start and current mouse position
      this.drawImage(this.img, move);
    },
    
    mouseup : function() {
      
      this.isPanning = false;
      this.checkBounds();
      
    },
    
    checkBounds : function() {
      
      var move = this.move,
          origin = this.origin,
          scaleImg = this.scaleImg,
          canvas = this.canvas,
          maskHeight = this.maskHeight,
          correct = { x : 0, y : 0 },
          ctx = this.ctx;
      
      // reset the origin (top left) to the new location (top left) of the image
      origin.x += move.x;
      origin.y += move.y;
      
      ctx.translate(move.x, move.y);
      
      // check we haven't overstepped the bounds
      
      // horzontal diff
      var hDiff = (scaleImg.width + origin.x);
      
      // too far right (snap back to LHS)
      if (hDiff >= scaleImg.width) {
        correct.x = -origin.x;
      }
      
      // too far left (snap back to RHS)
      if (hDiff <= canvas.width) {
        correct.x = canvas.width - hDiff;
      }
      
      // Vertical diff and maskOffset (take into accout the letterbox - snap back to that rather than the top and bottom of the canvas)
      var vDiff = (scaleImg.height + origin.y),
          maskOffset = (canvas.height - maskHeight);
      
      // too far down (snap back to TOP)
      if (vDiff >= (scaleImg.height + maskHeight)) {
        correct.y = -origin.y + maskHeight;
      }
      
      // too far up (snap back to BOTTOM)
      if (vDiff <= maskOffset) {
        correct.y = maskOffset - vDiff;
      }
      
      if (correct.y === 0 && correct.x === 0) { return; }
        
      this.drawImage(this.img, correct);
      ctx.translate(correct.x, correct.y);
      
      origin.x += correct.x;
      origin.y += correct.y;
      
    },
    
    drawImage : function(img, pos) {
      var scaleImg = this.scaleImg,
          canvas = this.canvas,
          pos = pos || {},
          ctx = this.ctx;
      
      // clear the canvas (otherwise we get psychadelic trails)
      ctx.save();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      
      // draw the image
      ctx.drawImage(img, pos.x || 0, pos.y || 0, scaleImg.width, scaleImg.height);
      this.letterBox(ctx);
    },
    
    cropImage : function() {
      
      var maskHeight = this.maskHeight,
          scaleImg = this.scaleImg,
          ctx = this.ctx;
      
      console.log(this.move.x, this.move)
      
      ctx.drawImage(this.img, this.move.x, -maskHeight, scaleImg.width, scaleImg.height);
      this.canvas.height -= (maskHeight * 2);
      ctx.drawImage(this.img, this.move.x, this.move.y, scaleImg.width, scaleImg.height);
      
    },
    
    exportImage : function(width, height) {
      
      var scaleImg = this.scaleImg,
          width = width || scaleImg.width,
          height = height || scaleImg.height,
      
      // create a new canvas instance with the image at full width and height - this is what we transmit via ajax
          canvas = this.createCanvas(scaleImg.width, scaleImg.height),
          ctx = canvas.getContext('2d');
      
      ctx.drawImage(this.img, 0, 0, scaleImg.width, scaleImg.height);
      
      return canvas.toDataURL("image/png");
    }
    
  };
  
  window.CroppingTool = CroppingTool;
  
})(document, window);