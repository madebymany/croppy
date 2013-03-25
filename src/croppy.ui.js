var UI = function() {

  // create a parent wrapper for the canvas
  var parent = this.createElement("div", {
    "class" : "croppy__parent"
  });

  // create zoom interface buttons
  var html = this.createElements(this.elements);

  parent.appendChild(html);

  return parent;

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

};

UI.prototype = UI.fn = {

  elements : [
    ["a", { "class" : "croppy__zoom-in",  "text" : "+" }],
    ["a", { "class" : "croppy__zoom-out", "text" : "-" }],
    ["a", { "class" : "croppy__crop",     "text" : "crop" }],
    ["a", { "class" : "croppy__reset",    "text" : "reset" }],
    ["a", { "class" : "croppy__change",   "text" : "change" }]
  ],

  removeElement : function(el) {
    // el.removeEventListener();
    el.parentNode.removeChild(el);
  },

  addEventListeners : function(el, events, useCapture) {

    if (typeof events === "undefined") { return el; }

    for (var event in events) {
      if (!events.hasOwnProperty(event)) {continue;}
      el.addEventListener(event, events[event], useCapture);
    }

    return el;
  },

  setAttributes : function(el, attributes) {

    if (typeof attributes.text !== "undefined") {
      el.textContent = attributes.text;
      delete attributes.text;
    }

    for (var attribute in attributes) {
      if (!attributes.hasOwnProperty(attribute) || attribute === "events") {continue;}
      el.setAttribute(attribute, attributes[attribute]);
    }

    return el;
  },

  createElements : function(argsList){
    var fragment = document.createDocumentFragment();
    argsList.forEach(function(args){
      fragment.appendChild(this.createElement.apply(this, args));
    }, this);
    return fragment;
  },

  createElement : function(el, attributes, events) {

    el = document.createElement(el);

    if (arguments.length === 1) {
      return el;
    }

    if (typeof attributes === "string") {
      el.textContent = attributes;
    } else {
      this.setAttributes(el, attributes, events);
    }

    this.addEventListeners(el, extend(events || {}, attributes.events), false);

    return el;
  }

};
