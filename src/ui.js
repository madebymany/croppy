var EventEmitter = require('events');
var inherits = require('util').inherits;

var buttonTemplate = require('./templates/button.jst');
var textTemplate = require('./templates/text.jst');

var UI = function(config) {
  EventEmitter.call(this);

  this.config = Object.assign(config, {default_text: "Some text…"});
  this.createEl();
  this.render();
  this.delegateEvents();
};

module.exports = UI

inherits(UI, EventEmitter);

Object.assign(UI.prototype, {

  is_enabled : true,

  delegateEvents: function() {

    this.undelegateEvents();

    var callIfMatches = function (selector, f, e) {
      e = e.target;
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

    Object.keys(evs).forEach(function(type) {
      this.el.addEventListener(type, evs[type]);
    }, this);

    this.delegatedEvents = evs;
  },

  items : ["zoomin", "zoomout", "done", "rotate", "orientation", "text", "16:9", "4:3", "1:1"],

  createEl : function() {
    this.el = document.createElement('div');
    this.el.class = 'croppy__ui'
  },

  render : function() {
    this.el.innerHTML = buttonTemplate(this.config.ui);
    return this;
  },

  dispatch_text: function(e) {
    this.emit("ui:text:input", e && e.value);
  },

  dispatch_text_button: function(e) {
    this.emit("ui:text:action", e.name, e.value);
  },

  dispatch_event : function(e) {
    var action = e.dataset.action;
    if (this.is_enabled) {
      this.emit("ui:" + action);
    }
    if (action === "text") {
      this.toggle_text_ui();
    }
  },

  toggle_text_ui: function() {
    var text_ui = this.el.querySelector(".croppy-text");
    if (text_ui !== null) {
      this.dispatch_text();
      text_ui.parentNode.removeChild(text_ui);
    } else {
      this.el.insertAdjacentHTML('beforeend',
          textTemplate({default_text: this.config.default_text}));
      this.dispatch_text({target: {value: this.config.default_text}});
    }
  },

  undelegateEvents : function() {
    if (typeof this.delegatedEvents === 'undefined') {
      return;
    }

    this.delegatedEvents.forEach(function(ev) {
      this.el.removeEventListener(ev.type, ev.listener);
    });
  },

  remove : function() {
    this.undelegateEvents();
    this.el.parentNode.removeChild(this.el);
  }
});
