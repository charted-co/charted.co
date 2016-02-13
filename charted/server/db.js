

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileDb = function () {
  function FileDb(path) {
    _classCallCheck(this, FileDb);

    try {
      _fs2.default.accessSync(path);
    } catch (err) {
      if (err.code != 'ENOENT') {
        throw err;
      }

      _fs2.default.writeFileSync(path, '{}', 'utf8');
    }

    this.path = path;
  }

  _createClass(FileDb, [{
    key: "getAll",
    value: function getAll() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _fs2.default.readFile(_this.path, 'utf8', function (err, data) {
          if (err) reject(err);
          resolve(JSON.parse(data));
        });
      });
    }
  }, {
    key: "get",
    value: function get(key) {
      return this.getAll().then(function (data) {
        return data[key];
      });
    }
  }, {
    key: "set",
    value: function set(key, value) {
      var _this2 = this;

      return this.getAll().then(function (data) {
        data[key] = value;

        return new Promise(function (resolve, reject) {
          _fs2.default.writeFile(_this2.path, JSON.stringify(data), 'utf8', function (err) {
            if (err) reject(err);
            resolve();
          });
        });
      });
    }
  }]);

  return FileDb;
}();

exports.default = FileDb;