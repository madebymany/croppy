(function(document, window){
  
  // Constructor
  var CroppingTool = function(img, config) {
    
    config = config || {};
    
    var preview = config.preview || document.querySelector("#preview");
    
    // Smallest width (visible canvas area)
    var editorWidth = this.editorWidth = config.editorWidth || 580;
    
    // Max width available for whole site - no image on the site will ever have to be bigger than this
    var transmitWidth = this.transmitWidth = config.maxWidth || 1000;
    
    // what percentage of image width is transmit width?
    var percentage = (transmitWidth / img.width) * 100;
    
    // this is the multiplyer for the crop function - the ratio of the editor width to the transmit width
    this.cropRatio = (transmitWidth / editorWidth);

    // Panning state
    this.isPanning = false;
    
    // this is what performs the actual crop - never added to the dom
    var cropCanvas = this.cropCanvas = this.createCanvas(this.transmitWidth, img);
    
    // this is what the user sees - scaled version of the one above
    this.canvas = this.createCanvas(this.editorWidth, img);
    
    // the image is too small
    if (percentage > 100 || cropCanvas.height < Math.round(0.5625 * transmitWidth)) { 
      console.log("image is too small");
      this.destroy();
      return false; 
    }
        
    // Largest width possible so that max zoom level does not exceed max available for the whole site (transmitWidth)
    // this is different to the transmitWidth! imagine the image is zoomed in 100%, the part of the image you see is transmitWidth, 
    // maxWidth is the maximum width allowed to acheive this
    this.maxWidth = Math.round((editorWidth * 100) / percentage);
    
    // store img on instance
    this.img = img;
    
    // baseline for origin of the image relative to top left of canvas - this will move around every time we redraw the image
    this.origin = { x : 0, y : 0 };
    
    // the scale of the image drawn on the canvas
    this.scaleImg = this.canvas.scale;
    
    var canvas = this.canvas;
    
    // amount to resize the image by when zooming in and out
    this.resizeAmt = (this.maxWidth * 10) / 100;
    
    // create a parent wrapper for the canvas
    var parent = document.createElement("div");
    parent.className = "crop-parent";
    parent.style.width = editorWidth + "px";
    
    // add the parent to the canvas object
    canvas.parent = parent;
    
    // main initialisation function
    this.start(canvas);
    
    // wrap the canvas in the parent
    parent.appendChild(canvas.canvas);
    
    // place the parent in the dom
    preview.appendChild(parent);
    
    preview.appendChild(this.cropCanvas.canvas);
  
    // create zoom interface buttons
    this.createUIElement(canvas, "zoomin", "+", "top");
    this.createUIElement(canvas, "zoomout", "-", "top");
                               
    // create crop button      
    this.createUIElement(canvas, "crop", "crop", "bottom");
    this.createUIElement(canvas, "reset", "reset", "bottom");
    
    parent = null;
    canvas = null;
    preview = null;
    config = null;
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
          switch(e.target.dataset.ui) {
            case "crop":
              this.crop();
              break;
            case "reset":
              this.reset();
              break;
            default:
              this.zoom(e, this.resizeAmt); 
          }
        break;
        //case "wheel": case "scroll": case "mousewheel": this.zoom(e, 5); break;
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
      
      // limit allows us to specify whether we want the scale to be restricted to 100% of the max 
      scale = (limit && scale > 1) ? 1 : scale;

      return {
        width : parseInt(width * scale, 10),
        height : parseInt(height * scale, 10)
      };
    },
    
    createCanvas : function(width, img) {
      
      var canvas = document.createElement("canvas"),
          ratioHeight = Math.round(0.5625 * width),
          scale = this.scale(width, img, true),
          maskHeight = (scale.height - ratioHeight) / 2;
      
      canvas.width = width;
      canvas.height = scale.height;
      
      return {
        width : scale.width,
        height : scale.height,
        canvas : canvas,
        ctx : canvas.getContext('2d'),
        scale : scale,
        // this is the height of an individual mask (one of the letterbox things top and bottom)
        maskHeight : maskHeight,
        // this is the distance between the top 0 x 0 point and position that we need to place the bottom mask
        maskOffset : ratioHeight + maskHeight,
        ratioHeight : ratioHeight
      };
      
    },
    
    start : function(obj) {
      
      var canvas = obj.canvas,
          origin = this.origin;
      
      obj.parent.classList.add("active");

      canvas.addEventListener("mousedown", this, false);
      canvas.addEventListener("mousemove", this, false);
      canvas.addEventListener("mouseup", this, false);
      
      // canvas.addEventListener("wheel", this, false);
      // canvas.addEventListener("scroll", this, false);
      // canvas.addEventListener("mousewheel", this, false);
      
      this.draw(origin);
      // reset the origin relative to the top left of the canvas
      obj.ctx.translate(origin.x, origin.y);
    },
    
    end : function(obj) {
      
      var canvas = obj.canvas;
      
      obj.parent.classList.remove("active");
      
      // disable mouse events
      canvas.removeEventListener("mousedown", this, false);
      canvas.removeEventListener("mousemove", this, false);
      canvas.removeEventListener("mouseup", this, false);
      
      // canvas.removeEventListener("wheel", this, false);
      // canvas.removeEventListener("scroll", this, false);
      // canvas.removeEventListener("mousewheel", this, false);
      
    },
    
    // this is the letterbox that appears at the top and bottom of the image in the editor.
    // needs to be redrawn everytime the canvas is redrawn
    letterBox : function(ctx) {
      
      //var editorWidth = this.editorWidth,
      
      var canvas = this.canvas,
          width = canvas.width,
          maskHeight = canvas.maskHeight;
      
      ctx.save();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, width, maskHeight);
      ctx.fillRect(0, canvas.maskOffset, width, maskHeight);
      ctx.restore();
    },
    
    position : function(e) {
      return {
        x : e.layerX,
        y : e.layerY
      };
    },
    
    createUIElement : function(canvas, name, text, pos) {
      
      // function for creating ui buttons - might make this a static method 
      var el = document.createElement("a");
      
      el.textContent = text;
      el.dataset.ui = name;
      el.className = name + " crop-ui";
      el.addEventListener("click", this, false);
      el.style[pos] = ((name === "zoomout") ? canvas.maskHeight + 30 : canvas.maskHeight + 10) + "px";
      
      canvas.parent.insertBefore(el, canvas.canvas);
    },
    
    // click, click, ZOOM!!
    zoom : function(e, amt) {
      
      amt = amt || 1;
      
      var target = e.target,
          scaleImg = this.scaleImg,
          offset = scaleImg.width,
          wheel = e.wheelDeltaY || false;
          
      e.preventDefault();
      
      // Increment or decrement depending on the button pushed or direction of the scroll wheel
      offset += (target.dataset.ui === "zoomin") ? amt : -amt; // || (wheel && wheel > 0)) ? amt : -amt;
      
      if (offset > this.maxWidth) {
        console.log("cannot go larger than this");
        offset = this.maxWidth;
      } else if (offset < this.editorWidth) {
        console.log("cannot go smaller than this");
        offset = this.editorWidth;
      }
      
      // scale the image based on the offset which is current width +/- amt
      var newSize = this.scaleImg = this.scale(offset, scaleImg);
      
      // offset the image by the inverse of half the difference between the old width and height and the new width and height
      // this will make it look like we're resizing from the center
      this.move = { x : ~~(((newSize.width - scaleImg.width) / 2) * -1), y : ~~(((newSize.height - scaleImg.height) / 2) * -1) };
      
      // no need to specify origin as it has already been reset
      this.draw(this.move);
      
      // check that we haven't overstepped the bounds of the crop area
      this.checkBounds();
    },
    
    mousedown : function(e) {
      // we are panning, start tracking the mouse position
      this.isPanning = true;
      
      // cache the start position, so we can track the mouse move relative to this point
      this.postStart = this.position(e);
    },
    
    mousemove : function(e) {
      
      // if we are no longer panning, stop tracking the mouse position
      if (!this.isPanning) { return; }
        
      var pos = this.position(e),
          posStart = this.postStart,
          move = this.move = { x : (pos.x - posStart.x), y : (pos.y - posStart.y) };
      
      // move the image by the difference between the cached start and current mouse position
      this.draw(move);
    },
    
    mouseup : function() {
      
      // we are no longer panning stop tracking the mouse position
      this.isPanning = false;
      
      // check that we haven't overstepped the bounds of the crop area
      this.checkBounds();
    },
    
    checkBounds : function() {
      
      // move = the amount the mouse cursor has moved relative to its start position
      // origin = the top left of the image relative to the top left of the canvas. We use this later to determine where to crop
      
      var move = this.move,
          origin = this.origin,
          scaleImg = this.scaleImg,
          canvas = this.canvas,
          maskHeight = canvas.maskHeight,
          correct = { x : 0, y : 0 },
          ctx = canvas.ctx;
      
      // reset the origin (top left) to the new location (top left) of the image
      origin.x += move.x;
      origin.y += move.y;
      
      // set the translate origin to the new position
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
      
      // if we don't need to make a correction - return 
      if (correct.y === 0 && correct.x === 0) { return; }
      
      // otherwise, draw the image in the new position
      this.draw(correct);
      
      // set the translate origin to the new position
      ctx.translate(correct.x, correct.y);
      
      // add the correction to the origin, so that we can keep track of the position relative to the top left of the canvas
      origin.x += correct.x;
      origin.y += correct.y;
      
    },
    
    draw : function(pos) {
      
      pos = pos || {};
      
      var scaleImg = this.scaleImg,
          canvas = this.canvas,
          ctx = canvas.ctx;
      
      // clear the canvas (otherwise we get psychadelic trails)
      ctx.save();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      
      // draw the image
      ctx.drawImage(this.img, pos.x || 0, pos.y || 0, scaleImg.width, scaleImg.height);
      this.letterBox(ctx);
      
    },
    
    destroy : function() {
      
      var canvas = this.canvas,
          el = canvas.parent;
      
      if (el) {
        el.parentNode.removeChild(el);
        el = null;
      }
      
      this.end(canvas);
      
      this.canvas = null;
      this.cropCanvas = null;
    },
    
    reset : function() {
      
      var canvas = this.canvas;
      
      // reinstate the canvas height with the letterboxing (un 16 x 9 it)
      canvas.canvas.height = canvas.height;
      // turn on the event listeners for the canvas
      this.start(canvas);
    },
    
    crop : function() {
      
      var canvas = this.canvas,
          maskHeight = canvas.maskHeight,
          scaleImg = this.scaleImg,
          ctx = canvas.ctx,
          origin = this.origin;
      
      // resize canvas first to remove mask and make the image 16 x 9
      canvas.canvas.height -= (maskHeight * 2);
      
      // draw the image relative to the tracked origin (minus the maskheight for the y axis)
      ctx.drawImage(this.img, origin.x, origin.y - maskHeight, scaleImg.width, scaleImg.height);
      
      // transmit crop
      var cropCanvas = this.cropCanvas,
          cropCtx = cropCanvas.ctx;
      
      // reset canvas height to 16 * 9 height
      cropCanvas.canvas.height = cropCanvas.ratioHeight;

      // draw the image
      cropCtx.drawImage(this.img, (origin.x * this.cropRatio), (origin.y * this.cropRatio) - cropCanvas.maskHeight, ~~(scaleImg.width * this.cropRatio), ~~(scaleImg.height * this.cropRatio));
      
      // turn off the event listeners for the canvas
      this.end(canvas);
      
      //return cropCtx.toDataURL("image/png");
    }
    
  };
  
  window.CroppingTool = CroppingTool;
  
})(document, window);