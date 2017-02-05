'use strict';

define(['exports', './Editor'], function (exports, _Editor) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.testEditor = testEditor;

  var _Editor2 = _interopRequireDefault(_Editor);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function testEditor(test) {
    // We need to append this sandbox to the DOM because
    // otherwise innerText omits newlines.
    var sandbox = document.createElement('div');
    document.body.appendChild(sandbox);

    var editor = new _Editor2.default(sandbox);
    test.equal('', editor.getContent());
    test.ok(editor.rootElement.classList.contains('empty'));

    editor.setContent('Hello\nWorld');
    test.equal('Hello\nWorld', editor.getContent());
    test.ok(!editor.rootElement.classList.contains('empty'));

    sandbox.innerHTML = 'Hello<div>World</div>';
    test.equal('Hello\nWorld', editor.getContent());
    test.ok(!editor.rootElement.classList.contains('empty'));

    document.body.removeChild(sandbox);
    test.done();
  }
});