var Wrapper = function(img, config) {
  this.ui = new UI();
  this.interface = new Interface(img, config);
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
    console.log(this.interface.canvas.$el);
    this.$el.append(this.ui.$el, this.interface.canvas.$el);
  },

  addListeners : function() {
    _.forEach(this.ui.items, function(action){
      this.listenTo(this.ui, "ui:" +  action, _.bind(this.interface.actions[action], this.interface));
    }, this);
  }

});