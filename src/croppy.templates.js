this["JST"] = this["JST"] || {};

this["JST"]["src/templates/button.jst"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="croppy__actions">\n  <div class="croppy__zoom croppy__action">\n    <a class="croppy-icon croppy__zoomin js-croppy-btn" data-action="zoomin">zoomin</a>\n    <a class="croppy-icon croppy__zoomout js-croppy-btn" data-action="zoomout">zoomout</a>\n    <span class="croppy__action__label">Zoom</span>\n  </div>\n\n  <div class="croppy__rotate croppy__action">\n    <a class="croppy-icon croppy__rotate js-croppy-btn" data-action="rotate">rotate</a>\n    <span class="croppy__action__label">Rotate</span>\n  </div>\n\n  <div class="croppy__text croppy__action">\n    <a class="croppy-icon croppy__text js-croppy-btn" data-action="text">croppytext</a>\n    <span class="croppy__action__label">Text</span>\n  </div>\n\n  <div class="croppy__save croppy__action">\n    <a class="croppy-icon croppy__done js-croppy-btn" data-action="done">done</a>\n    <span class="croppy__action__label">Save</span>\n  </div>\n</div>\n';

}
return __p
};

this["JST"]["src/templates/text.jst"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="croppy-text">\n  <div class="croppy-text__left">\n    <label for="croppy_text_headline" class="croppy-text__label">Headline</label>\n    <textarea id="croppy_text_headline" class="js-croppy-headline">' +
((__t = ( default_text )) == null ? '' : __t) +
'</textarea>\n  </div>\n  <div class="croppy-text__right">\n    <fieldset class="croppy-text__controls">\n      <legend class="croppy-text__label">Alignment</legend>\n        <input class="croppy-text__control" id="croppy_align_left" type="radio" checked name="alignment" value="left" />\n        <label for="croppy_align_left" class="croppy-text__btn">left</label>\n        <input class="croppy-text__control" id="croppy_align_center" type="radio" name="alignment" value="center" />\n        <label for="croppy_align_center" class="croppy-text__btn">center</label>\n        <input class="croppy-text__control" id="croppy_align_right" type="radio" name="alignment" value="right" />\n        <label for="croppy_align_right" class="croppy-text__btn">right</label>\n    </fieldset>\n    <fieldset class="croppy-text__controls">\n      <legend class="croppy-text__label">Distribution</legend>\n        <input class="croppy-text__control" id="croppy_dist_top" type="radio" name="distribution" value="top" />\n        <label for="croppy_dist_top" class="croppy-text__btn">top</label>\n        <input class="croppy-text__control" id="croppy_dist_middle" type="radio" name="distribution" value="middle" />\n        <label for="croppy_dist_middle" class="croppy-text__btn">middle</label>\n        <input class="croppy-text__control" id="croppy_dist_bottom" type="radio" checked name="distribution" value="bottom" />\n        <label for="croppy_dist_bottom" class="croppy-text__btn">bottom</label>\n    </fieldset>\n  </div>\n </div>\n\n';

}
return __p
};