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

var isArray = function (obj) {
  return obj && obj.constructor == Array;
};






