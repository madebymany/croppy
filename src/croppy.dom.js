var CroppyDom = Object.create({

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
});
