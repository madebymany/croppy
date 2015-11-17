module.exports.calculate_aspect_ratio = function(width, height) {
  return height / width;
};

module.exports.get_height_from_width = function(width, aspect_ratio) {
  return Math.round(width * aspect_ratio);
};

module.exports.get_width_from_height = function(height, aspect_ratio) {
  return Math.round(height / aspect_ratio);
};

module.exports.scale = function(scale_factor, num) {
  return Math.round(num * scale_factor);
};
