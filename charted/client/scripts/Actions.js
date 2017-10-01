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

  var Actions = function () {
    function Actions(el) {
      _classCallCheck(this, Actions);

      this.rootElement = el;
      this.listeners = {};
    }

    _createClass(Actions, [{
      key: 'activate',
      value: function activate() {
        this.boundListener = this.handleClick.bind(this);
        this.rootElement.addEventListener('click', this.boundListener);
      }
    }, {
      key: 'deactivate',
      value: function deactivate() {
        if (this.boundListener) {
          this.rootElement.removeEventListener('click', this.boundListener);
        }

        delete this.boundListener;
        delete this.rootElement;
        this.listeners = {};
      }
    }, {
      key: 'add',
      value: function add(name, listener, thisObj) {
        if (!this.listeners[name]) {
          this.listeners[name] = [];
        }

        this.listeners[name].push(listener.bind(thisObj));
        return this;
      }
    }, {
      key: 'handleClick',
      value: function handleClick(ev) {
        var target = ev.target;

        if (!(target instanceof Element)) {
          return;
        }

        if (target instanceof HTMLElement) {
          if (target.nodeName == 'BUTTON' && target.getAttribute('type') == 'submit') {
            return;
          }
        }

        var root = this.rootElement.parentNode;
        while (target && target != root && target != document) {
          if (target instanceof HTMLElement) {
            var _name = target.getAttribute('data-click');

            // If the element doesn't have a data-click property but is something
            // you'd want to click on (like a text field), return without firing.
            if (this.isClickable(target) && !_name) {
              return;
            }

            if (_name) {
              this.fire(_name, target, ev);
              return;
            }
          }

          target = target.parentNode;
        }
      }
    }, {
      key: 'isClickable',
      value: function isClickable(el) {
        switch (el.nodeName) {
          case 'BUTTON':
          case 'LINK':
          case 'INPUT':
          case 'TEXTAREA':
            return true;
          default:
            if (el.getAttribute('contenteditable')) {
              return true;
            }
        }

        return false;
      }
    }, {
      key: 'fire',
      value: function fire(name, target, ev) {
        if (!this.listeners[name]) {
          return;
        }

        this.listeners[name].forEach(function (fn) {
          fn(target, name, ev);
        });

        ev.stopPropagation();
        ev.preventDefault();
      }
    }]);

    return Actions;
  }();

  exports.default = Actions;
});