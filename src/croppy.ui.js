var ui = Image.prototype.ui = {

  initUi : function() {

    // // create a parent wrapper for the canvas
    // var parent = document.createElement("div");
    // parent.className = "crop-parent";
    // parent.style.width = editorWidth + "px";

    // // add the parent to the canvas object
    // canvas.parent = parent;

    // // main initialisation function
    // this.start(canvas);

    // // wrap the canvas in the parent
    // parent.appendChild(canvas.canvas);

    // // place the parent in the dom
    // preview.appendChild(parent);

    // // for debug purposes
    // //preview.appendChild(this.cropCanvas.canvas);

    // // create zoom interface buttons
    // this.createUIElement(canvas, "zoomin", "+", "top");
    // this.createUIElement(canvas, "zoomout", "-", "top");

    // // create crop and reset buttons
    // this.createUIElement(canvas, "crop", "crop", "bottom");
    // this.createUIElement(canvas, "reset", "reset", "bottom");
    // // this.createUIElement(canvas, "change", "change image", "bottom");

    // parent = null;
    // canvas = null;
    // preview = null;
    // config = null;

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

  }
};
