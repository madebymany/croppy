var Wrapper = function(img, config) {
  this.ui = new UI();
  this.canvas = new Canvas(img, config);
  this.createEl();
  this.render();
  return this;
};

Wrapper.fn = _.extend(Wrapper.prototype, Eventable, {

  createEl : function() {
    this.$el = $('<div>', {"class": "croppy__instance"});
  },

  render : function() {
    this.$el.append(this.ui.$el, this.canvas.$el);
  }

});