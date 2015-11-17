var UI = function(config) {
  this.config = config || {};
  this.createEl();
  this.render();
  this.delegateEvents();
};

UI.fn = Object.assign(UI.prototype, Eventable, {

  is_enabled : true,

  delegateEvents: function() {

    this.undeleateEvents();

    var callIfMatches = function (selector, f, e) {
      var matches = function(el, selector) {
        return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
      };
      if (matches(e, selector)) {
        return f(e);
      }
    }

    var evs = {
      click: callIfMatches.bind(undefined, ".js-croppy-btn",
          this.dispatch_event.bind(this)),
      keyup: callIfMatches.bind(undefined, ".js-croppy-headline",
          this.dispatch_text.bind(this)),
      change: callIfMatches.bind(undefined, ".croppy-text__control",
          this.dispatch_text_button.bind(this))
    }

    evs.keys.forEach(function(type) {
      this.$el.addEventListener(type, evs[type]);
    });

    this.delegatedEvents = evs;
  },

  items : ["zoomin", "zoomout", "done", "rotate", "orientation", "text", "16:9", "4:3", "1:1"],

  createEl : function() {
    this.$el = document.createElement('div');
    this.$el.class = 'croppy__ui'
  },

  render : function() {
    this.$el.innerHTML = JST["src/templates/button.jst"](this.config.ui);
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
    var text_ui = this.$el.querySelector(".croppy-text");
    if (text_ui !== null) {
      this.dispatch_text();
      text_ui.parentNode.removeChild(text_ui);
    } else {
      this.$el.insertAdjacentHTML('beforeend',
          JST["src/templates/text.jst"]({default_text: DEFAULT_TEXT}));
      this.dispatch_text({target:{value:DEFAULT_TEXT}});
    }
  },

  undelegateEvents : function() {
    if (typeof this.delegatedEvents === 'undefined') {
      return;
    }

    this.delegatedEvents.forEach(function(ev) {
      this.$el.removeEventListener(ev.type, ev.listener);
    });
  },

  remove : function() {
    this.undelegateEvents();
    this.$el.parentNode.removeChild(this.$el);
  }
});
