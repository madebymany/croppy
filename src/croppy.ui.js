var UI = function() {
  this.createEl();
  this.render();
  this.delegateEvents();
};

UI.fn = _.extend(UI.prototype, Eventable, {

  delegateEvents: function() {
    _.forIn(this.items, function(value, key){
      this.$el.delegate("." + key, "click", this.dispatch_event.bind(this));
    }, this);
  },

  items : {
    "croppy__zoomin"      : "zoomin",
    "croppy__zoomout"     : "zoomout",
    "croppy__done"        : "done",
    "croppy__redo"        : "redo",
    "croppy__new-image"   : "new_image",
    "croppy__orientation" : "orientation"
  },

  createEl : function() {
    this.$el = $('<div>', {"class": "croppy__ui"});
  },

  render : function() {
    this.$el.html(this.template());
    return this;
  },

  template : function() {
    var template = "";
    _.forIn(this.items, function(value, key){
      template += "<a class=\"croppy-icon " + key + "\">" + value + "</a>";
    });
    return template;
  },

  dispatch_event : function(e) {
    this.trigger("ui:" + e.target.className.match(/croppy__(\S+)/)[1]);
  },

  remove : function() {
    this.$el.undelegate().remove();
  }

});
