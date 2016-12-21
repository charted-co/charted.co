'use strict';

define(['exports'], function (exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Editor = function () {
    function Editor(el) {
      var _this = this;

      _classCallCheck(this, Editor);

      this.rootElement = el;

      this.listener = function () {};

      this.setContent(this.getContent());
      this.rootElement.addEventListener('focusout', function () {
        var content = _this.getContent();

        _this.setContent(content);

        _this.listener(content);
      });
    }

    _createClass(Editor, [{
      key: 'onChange',
      value: function onChange(fn) {
        this.listener = fn;
      }
    }, {
      key: 'getContent',
      value: function getContent() {
        var content = this.rootElement.innerText;
        return content ? content.trim() : '';
      }
    }, {
      key: 'setContent',
      value: function setContent(text) {
        if (!text) {
          this.rootElement.innerHTML = '';
          this.rootElement.classList.add('empty');
          return;
        }

        var sandbox = document.createElement('div');
        sandbox.innerHTML = text;
        var sanitizedText = sandbox.innerText;
        var sanitizedHTML = (sanitizedText || '').split('\n').map(function (line) {
          return '<div>' + line + '</div>';
        }).join('');
        this.rootElement.innerHTML = sanitizedHTML;
        this.rootElement.classList.remove('empty');
      }
    }]);

    return Editor;
  }();

  exports.default = Editor;
});