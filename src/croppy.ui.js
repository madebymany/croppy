var UI = function() {

  // create a parent wrapper for the canvas
  var parent = CroppyDom.createElement("div", {
    "class" : "croppy__parent"
  });

  // create interface buttons
  var html = CroppyDom.createElements(this.elements);

  parent.appendChild(html);

  return parent;

};

UI.prototype = UI.fn = {

  elements : [
    ["a", { "class" : "croppy__zoom-in",  "text" : "+" }],
    ["a", { "class" : "croppy__zoom-out", "text" : "-" }],
    ["a", { "class" : "croppy__crop",     "text" : "crop" }],
    ["a", { "class" : "croppy__reset",    "text" : "reset" }],
    ["a", { "class" : "croppy__change",   "text" : "change" }]
  ]

};
