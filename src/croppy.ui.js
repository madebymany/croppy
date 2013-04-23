var UI = function() {

  // create a parent wrapper for the canvas
  var parent = CroppyDom.createElement("div", {
    "class" : "croppy__parent"
  });

  // create interface buttons
  console.log(this.elements);
  var html = CroppyDom.createElements(this.elements);

  parent.appendChild(html);

  return parent;

};

UI.prototype = UI.fn = {

  elements : [
    ["a", {
      "class" : "croppy-icon croppy__zoom-in",
      "text" : "zoomin",
      "events": {
        "click" : "boom"
      }
    }],
    ["a", { "class" : "croppy-icon croppy__zoom-out", "text" : "zoomout" }],
    ["a", { "class" : "croppy-icon croppy__crop",     "text" : "done" }],
    ["a", { "class" : "croppy-icon croppy__reset",    "text" : "redo" }],
    ["a", { "class" : "croppy-icon croppy__change",   "text" : "new" }]
  ],

  boom : function() {
    alert("lol");
  }

};
