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
	
	var maxWidth = document.getElementById("maxWidth"),
			maxHeight = document.getElementById("maxHeight"),
			urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null,
			prepareImageFromFile = function() {}, imageFromFileCallback = function() {};
	
	// callback for the drop eventlistener
	function handleFileSelect(e) {

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
			scaleImage(this);
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
			scaleImage(this);
		};

		prepareImageFromFile = function(f) {
			fileReader.readAsDataURL(f);
		};
	} else {
		throw "Browser does not support createObjectUrl or fileReader - cannot continue";
	}

	function scaleImage(img) {
		
		var canvas = document.createElement('canvas'),
				width = img.width,
				height = img.height,
				
				// if you are not using fields for the width and height, remove the value attribute and set maxWidth and maxHeight to absolutes
		    scale = Math.min(
		      (maxWidth.value || width) / width,
		      (maxHeight.value || height) / height
		    );

		scale = (scale > 1) ? 1 : scale;
		
		width = img.width = parseInt(width * scale, 10);
		height = img.height = parseInt(height * scale, 10);
		
		/* Test for whether canvas is supported?
		if (!Modernizr.canvas || typeof canvas.getContext !== "function") {
	    return { img : img };
		}*/

		canvas.width = width;
		canvas.height = height;
		canvas.getContext('2d').drawImage(img, 0, 0, width, height);

		// probably delete this bit, it just displays the canvas as the preview
		var li = document.createElement("li");
		li.appendChild(canvas);
		previewList.appendChild(li);
		li = null;

		// returns the canvas dom object for the preview
		// also returns the dataurl to send to the server
		
		return {
			img : canvas,
			dataUrl : canvas.toDataURL("image/png")
		};
		
	}
	
	
})(document);