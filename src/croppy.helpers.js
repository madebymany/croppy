// shallow copy of one object to another

var extend = function(base) {

  var args = [].splice.call(arguments, 1);

  [].forEach.call(args, function(obj){

    // purposefully using == to compare null || undefined
    if (obj == null) {
      return;
    }

    for (var o in obj) {
      if (obj.hasOwnProperty(o)) {
        base[o] = obj[o];
      }
    }

  });

  return base;

};

var create = function(protoProps, staticProps) {

  var parent = this;
  var child = function(){ parent.apply(this, arguments); };

  // Add static properties to the constructor function, if supplied.
  extend(child, parent, staticProps);

  // Set the prototype chain to inherit from `parent`
  child.prototype = Object.create(parent.prototype);

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) {
    extend(child.prototype, protoProps);
  }

  return child;
};

var isArray = function (obj) {
  return obj && obj.constructor == Array;
};






