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

  var Classlist = function () {
    function Classlist() {
      _classCallCheck(this, Classlist);
    }

    _createClass(Classlist, [{
      key: 'add',
      value: function add(el, name) {
        if (el) el.classList.add(name);
      }
    }, {
      key: 'remove',
      value: function remove(el, name) {
        if (el) el.classList.remove(name);
      }
    }, {
      key: 'enable',
      value: function enable(el, name, cond) {
        cond ? this.add(el, name) : this.remove(el, name);
      }
    }, {
      key: 'toggle',
      value: function toggle(el, name) {
        if (el) {
          el.classList.contains(name) ? this.remove(el, name) : this.add(el, name);
        }
      }
    }]);

    return Classlist;
  }();

  function assert(el) {
    if (!el) throw 'Assertion error';
    return el;
  }

  function remove(el) {
    if (!el || !el.parentNode) return;
    el.parentNode.removeChild(el);
  }

  function renderFragment(html) {
    var fragment = document.createDocumentFragment();
    var temp = document.createElement('div');
    temp.innerHTML = html;

    while (temp.firstChild) {
      fragment.appendChild(temp.removeChild(temp.firstChild));
    }

    return fragment;
  }

  // Like querySelector and querySelectorAll but only for
  // js classes. Eventually we shouldn't use any other way
  // of getting elements.

  function get(selector, root) {
    root = root || document.body;

    if (/^js\-/.test(selector)) {
      return root.querySelector('.' + selector);
    }

    return null;
  }

  function getAll(selector, root) {
    root = root || document.body;

    if (/^js\-/.test(selector)) {
      return Array.prototype.slice.call(root.querySelectorAll('.' + selector));
    }

    return [];
  }

  function queryAll(selector, root) {
    root = root || document.body;
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  function rect(el) {
    return el.getBoundingClientRect();
  }

  exports.default = {
    assert: assert,
    get: get,
    getAll: getAll,
    queryAll: queryAll,
    rect: rect,
    renderFragment: renderFragment,
    remove: remove,
    classlist: new Classlist()
  };
});