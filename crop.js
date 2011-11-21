(function(document, window){
	
	// constants
	var editorWidth = 580,
			maxWidth = 1000;
	
	// change these values
	var preview = document.querySelector("#preview");
	
	var CroppingTool = function(img) {
		
		this.isPanning = false;
		this.createCanvasForImage(img, editorWidth);

		// probably delete this bit, it just displays the canvas as the preview
		preview.appendChild(this.canvas);

		// returns the canvas dom object for the preview
		// also returns the dataurl to send to the server

		return {
			img : this.canvas,
			dataUrl : this.canvas.toDataURL("image/png")//,
			//imageData : this.ctx.getImageData(0, 0, scaleImg.width, scaleImg.height) 
		};

	};
	
	CroppingTool.prototype = {
		
		handleEvent : function(e) {
			switch(e.type) {
				case "mousedown": this.mousedown(e); break;
				case "mousemove": this.mousemove(e); break;
				case "mouseup": this.mouseup(e); break;
			}
		},
		
		scale : function(max, width, height) {

			var scale = Math.min(
	      (max) / width,
	      height
	    );

			scale = (scale > 1) ? 1 : scale;

			return {
				width : parseInt(width * scale, 10),
				height : parseInt(height * scale, 10)
			};
		},
		
		sixteenByNine : function(n) {
			return ~~(0.5625 * n);
		},
		
		createCanvasForImage : function(img) {

			var canvas = document.createElement('canvas'),
					width = img.width,
					height = img.height;

			canvas.addEventListener("mousedown", this, false);
			canvas.addEventListener("mousemove", this, false);
			canvas.addEventListener("mouseup", this, false);

			var scaleImg = this.scale(maxWidth, width, height);
			var scaleCanvas = this.scale(editorWidth, width, height);

			canvas.width = scaleCanvas.width;
			canvas.height = scaleCanvas.height;

			var ctx = canvas.getContext('2d');
					ctx.drawImage(img, 0, 0, scaleImg.width, scaleImg.height);
			
			//this.scaleImg = scaleImg;
			this.img = img;
			this.canvas = canvas;
			this.ctx = ctx;
			this.scaleImg = scaleImg;
			this.origin = { x : 0, y : 0 };
			
			//this.t = new Transform();			
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
		
		mousedown : function(e) {
			this.isPanning = true;
			this.postStart = this.position(e);
		},
		
		mousemove : function(e) {

			if (!this.isPanning) { return; }
				
			var pos = this.position(e),
					posStart = this.postStart,
					move = this.move = { x : (pos.x - posStart.x), y : (pos.y - posStart.y) },
					ctx = this.ctx,
					canvas = this.canvas,
					scaleImg = this.scaleImg;
			
			ctx.save();
			ctx.setTransform(1,0,0,1,0,0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.restore();
			
			ctx.drawImage(this.img, move.x, move.y, scaleImg.width, scaleImg.height);

		},
		
		mouseup : function(e) {
			
			this.isPanning = false;
			
			var pos = this.position(e),
					move = this.move,
					origin = this.origin,
					scaleImg = this.scaleImg,
					canvas = this.canvas,
					correct = { x : 0, y : 0 },
					needsCorrecting = false,
					ctx = this.ctx;
			
			origin.x += move.x;
			origin.y += move.y;
			
			ctx.translate(move.x, move.y);
			
			// check we haven't overstepped the bounds
			if ((scaleImg.width + origin.x) >= scaleImg.width) {
				needsCorrecting = true;
				correct.x = -origin.x;
			}
			
			if ((scaleImg.width + origin.x) <= canvas.width) {
				needsCorrecting = true;
				correct.x = canvas.width - (scaleImg.width + origin.x);
			}
			
			if ((scaleImg.height + origin.y) >= scaleImg.height) {
				needsCorrecting = true;
				correct.y = -origin.y;
			}
			
			if ((scaleImg.height + origin.y) <= canvas.height) {
				needsCorrecting = true;
				correct.y = canvas.height - (scaleImg.height + origin.y);
			}
			
			if (needsCorrecting) {

				ctx.drawImage(this.img, correct.x, correct.y, scaleImg.width, scaleImg.height);
				ctx.translate(correct.x, correct.y);
				
				origin.x += correct.x;
				origin.y += correct.y;
				
			}
			
		}
		
	};
	
	window.CroppingTool = CroppingTool;
	
})(document, window);