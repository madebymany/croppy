var UI = function(config) {
  this.config = config || {};
  this.createEl();
  this.render();
  this.delegateEvents();
};

UI.fn = _.extend(UI.prototype, Eventable, {

  is_enabled : true,

  delegateEvents: function() {
    this.$el.on("click", ".js-croppy-btn", this.dispatch_event.bind(this));
    this.$el.on("keyup", ".js-croppy-headline", this.dispatch_text.bind(this));
    this.$el.on("change", ".croppy-text__control", this.dispatch_text_button.bind(this));
  },

  items : ["zoomin", "zoomout", "done", "rotate", "orientation", "text", "16:9", "4:3", "1:1"],

  createEl : function() {
    this.$el = $('<div>', {"class": "croppy__ui"});
  },

  render : function() {
    this.$el.html(JST["src/templates/button.jst"](this.config.ui));
    return this;
  },

  dispatch_text: function(e) {
    this.trigger("ui:text:input", e && e.target.value);
  },

  dispatch_text_button: function(e) {
    this.trigger("ui:text:action", e.target.name, e.target.value);
  },

  dispatch_event : function(e) {
    var action = e.target.dataset.action;
    if (this.is_enabled) {
      this.trigger("ui:" + action);
    }
    if (action === "text") {
      this.toggle_text_ui();
    }
  },

  toggle_text_ui: function() {
    var text_ui = this.$el.find(".croppy-text");
    if (text_ui.length) {
      this.dispatch_text();
      text_ui.remove();
    } else {
      this.$el.append(JST["src/templates/text.jst"]({default_text: DEFAULT_TEXT}));
      this.dispatch_text({target:{value:DEFAULT_TEXT}});
    }
  },

  remove : function() {
    this.$el.undelegate().remove();
  }
});
