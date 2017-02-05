"use strict";

define(["exports", "../shared/utils"], function (exports, _utils) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var utils = _interopRequireWildcard(_utils);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

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

  var PageData = function () {
    _createClass(PageData, null, [{
      key: "fromJSON",
      value: function fromJSON(url, data) {
        var ext = utils.getFileExtension(url);
        var rows = ext == 'tsv' ? d3.tsv.parseRows(data) : d3.csv.parseRows(data);
        return new PageData(rows);
      }
    }]);

    function PageData(rows) {
      var _this = this;

      _classCallCheck(this, PageData);

      // Extract field names and build an array of row objects
      // with field names as keys.
      var fieldNames = rows.shift();
      var fields = rows.map(function (row) {
        return fieldNames.reduce(function (memo, name, i) {
          memo[name] = row[i];
          return memo;
        }, {});
      });

      // Build a list of indices.
      if (fieldNames.length != 1) {
        (function () {
          var indexField = fieldNames.shift();
          _this.indices = fields.map(function (row) {
            return row[indexField];
          });
        })();
      } else {
        this.indices = fields.map(function (row, i) {
          return "Row " + (i + 1);
        });
      }

      // Build a list of serieses.
      this.serieses = fieldNames.map(function (label, i) {
        return { label: label, seriesIndex: i };
      });

      // Build a list of lists per each column.
      this.data = fieldNames.map(function (label) {
        return fields.map(function (row, i) {
          return {
            x: i,
            y: utils.stringToNumber(row[label]),
            xLabel: _this.indices[i],
            yRaw: row[label]
          };
        });
      });
    }

    return PageData;
  }();

  exports.default = PageData;
});