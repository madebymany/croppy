var calculate_aspect_ratio = function(width, height) {
  return height / width;
};

var get_height_from_width = function(width, aspect_ratio) {
  return Math.round(width * aspect_ratio);
};

var get_width_from_height = function(height, aspect_ratio) {
  return Math.round(height / aspect_ratio);
};

var scale = function(scale_factor, num) {
  return Math.round(num * scale_factor);
};