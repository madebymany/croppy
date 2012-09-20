(function(document){
	
	var dropZone = document.querySelector('#dropzone');

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
			new CroppingTool(this);
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
			new CroppingTool(this);
		};

		prepareImageFromFile = function(f) {
			fileReader.readAsDataURL(f);
		};
	} else {
		throw "Browser does not support createObjectUrl or fileReader - cannot continue";
	}
	
	/*
	function dataURItoBlob(dataURI, callback) {
	    // convert base64 to raw binary data held in a string
	    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
	    var byteString = atob(dataURI.split(',')[1]),
	
					// separate out the mime component
					mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0],

					// write the bytes of the string to an ArrayBuffer
					ab = new ArrayBuffer(byteString.length),
					ia = new Uint8Array(ab);
	
	    for (var i = 0, f; f = ia[i]; i++) {
	        f = byteString.charCodeAt(i);
	    }

	    // write the ArrayBuffer to a blob, and you're done
	    var bb = new BlobBuilder();
	    bb.append(ab);
	    return bb.getBlob(mimeString);
	}*/
	
	
})(document);