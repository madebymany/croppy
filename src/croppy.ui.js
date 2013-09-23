var UI = function() {
  this.createEl();
  this.render();
  this.delegateEvents();
};

UI.fn = _.extend(UI.prototype, Eventable, {

  is_enabled : true,

  delegateEvents: function() {
    _.forEach(this.items, function(item){
      this.$el.delegate(".croppy__" + item, "click", this.dispatch_event.bind(this));
    }, this);
  },

  items : ["zoomin", "zoomout", "done", "rotate", "orientation"],

  createEl : function() {
    this.$el = $('<div>', {"class": "croppy__ui"});
  },

  render : function() {
    var template = "";
    _.forEach(this.items, function(item) {
      template += this.template({ "action" : item });
    }, this);
    this.$el.html(template);
    return this;
  },

  dispatch_event : function(e) {
    if (this.is_enabled) {
      this.trigger("ui:" + e.target.dataset.action);
    }
  },

  remove : function() {
    this.$el.undelegate().remove();
  },

  template : _.template('<a class="croppy-icon croppy__<%=action%>" data-action="<%=action%>"><%=action%></a>')

});
