(function(document){
	
	// change these values
	var dropZone = document.getElementById('dropzone'),
			previewList = document.getElementById("previewList");

	// Setup the dnd listeners.
	dropZone.addEventListener('dragenter', handleDragEnter, false);
	dropZone.addEventListener('dragleave', handleDragLeave, false);
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);

	function handleDragEnter(e) {
	  // this / e.target is the current hover target.
	  this.classList.add('over');
	}

	function handleDragLeave(e) {
	  this.classList.remove('over');  // this / e.target is previous target element.
	}

	function handleDragOver(e) {
	  e.stopPropagation();
	  e.preventDefault();
	}
	
	// ======
	//
	// If you already have DnD, you probably just need the following
	//
	// ======
	
	var urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null,
		prepareImageFromFile = function() {}, imageFromFileCallback = function() {};
	
	// callback for the drop eventlistener
	function handleFileSelect(e) {
		
		this.classList.remove('over');
		
	  e.stopPropagation(); // Stops some browsers (I'm looking at you FF!) from redirecting.
		e.preventDefault();

		var files = e.dataTransfer.files,
				imageType = /image.*/;
		
	  // change this to asynchronous for loop if using _underscore
	  for (var i = 0, f; f = files[i]; i++) {
			
	    if (!f.type.match(imageType)) continue;
			prepareImageFromFile(f);
	  }
	}
	
	// init time branch to decide whether to use createObjectURL or fileReader to get data from dropped file 

	if (urlAPI && typeof urlAPI.createObjectURL === "function") {

		imageFromFileCallback = function() {
			urlAPI.revokeObjectURL(this.src);
			displayImage(this);
		};

		prepareImageFromFile = function(f) {
			var baseimg = document.createElement('img');
			baseimg.src = urlAPI.createObjectURL(f);
			baseimg.onload = imageFromFileCallback;
		};

	} else if (typeof FileReader !== "undefined" && typeof FileReader.prototype.readAsDataURL === "function") {

		var fileReader = new FileReader();

		fileReader.onload = function (e) {
			var baseimg = document.createElement('img');
			baseimg.src = e.target.result;
			baseimg.onload = imageFromFileCallback;
		};

		imageFromFileCallback = function () {
			displayImage(this);
		};

		prepareImageFromFile = function(f) {
			fileReader.readAsDataURL(f);
		};
	} else {
		throw "Browser does not support createObjectUrl or fileReader - cannot continue";
	}

	function displayImage(img) {
		
		var canvas = document.createElement('canvas'),
			width = img.width,
			height = img.height;

		canvas.width = width;
		canvas.height = height;
		
		var ctx = canvas.getContext('2d')
		ctx.drawImage(img, 0, 0, width, height);

		// probably delete this bit, it just displays the canvas as the preview
		var li = document.createElement("li");
		li.appendChild(canvas);
		previewList.appendChild(li);
		li = null;

		var imageData = ctx.getImageData(0, 0, width, height);
		
		var columns = [],
				col = [];
		
		// each 32 pixel wide column
		for (var w = width + 32; w-=32;) {
			
			col = [];
			
			// each pixel in the column
			for (var h = height; --h;) {
				col.push(getPixelData(imageData.data, w, h, width));
				break;
			}
			
			columns.push(col);
		}
	}
	
	function getPixelData(pixels, x, y, width) {
		var yw4x4 = ((y + 0.5) ^ 0) * width * 4 + ((x + 0.5) ^ 0) * 4;
		
		// create new pixel data from columns with HSL instead of rgb
		return rgbToHsl(
			pixels[yw4x4],
			pixels[yw4x4 + 1],
			pixels[yw4x4 + 2]
		)
	}
	
	function rgbToHsl(r, g, b){
		r /= 255, g /= 255, b /= 255;

		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if (max == min){
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return [h, s, l];
	}
	
	function euclideanDistance(p1, p2) {
		var pow = Math.pow,
				sqrt = Math.sqrt;
				
		return sqrt( pow((p1[0] - p2[0]), 2) + pow((p1[1] - p2[1]), 2) + pow((p1[2] - p2[2]), 2) );
	}
	
	
})(document);