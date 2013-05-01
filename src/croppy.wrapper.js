var Wrapper = function(img, config) {
  this.ui = new UI();
  this.canvas = new Canvas(img, config);
  this.createEl();
  this.render();
  this.addListeners();
  return this;
};

Wrapper.fn = _.extend(Wrapper.prototype, Eventable, {

  createEl : function() {
    this.$el = $('<div>', {"class": "croppy__instance"});
  },

  render : function() {
    this.$el.append(this.ui.$el, this.canvas.$el);
  },

  addListeners : function() {
    _.forEach(this.ui.items, function(action){
      this.listenTo(this.ui, "ui:" +  action, _.bind(this.canvas[action], this.canvas));
    }, this);
  }

});