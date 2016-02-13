"use strict";

define(["exports", "../shared/utils", "../shared/sha1"], function (exports, _utils, _sha) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var utils = _interopRequireWildcard(_utils);

  var _sha2 = _interopRequireDefault(_sha);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

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

  var COLOR_DARK = 'dark';
  var COLOR_LIGHT = 'light';
  var GRID_FULL = 'full';
  var GRID_SPLIT = 'split';
  var OPTIONS = {
    type: ['column', 'line'],
    rounding: ['on', 'off']
  };

  var ChartParameters = function () {
    function ChartParameters(url) {
      _classCallCheck(this, ChartParameters);

      this.url = url;
      this.charts = [{}];
      this.seriesColors = {};
      this.seriesNames = {};
      this._color = COLOR_LIGHT;
      this._grid = GRID_FULL;

      this._getDefaultTitle = function (i) {
        return '';
      };
    }

    _createClass(ChartParameters, [{
      key: "withDefaultTitle",
      value: function withDefaultTitle(fn) {
        this._getDefaultTitle = fn;
        return this;
      }
    }, {
      key: "isLight",
      value: function isLight() {
        return this._color == COLOR_LIGHT;
      }
    }, {
      key: "toggleColor",
      value: function toggleColor() {
        this._color = this.isLight() ? COLOR_DARK : COLOR_LIGHT;
      }
    }, {
      key: "isFull",
      value: function isFull() {
        return this._grid == GRID_FULL;
      }
    }, {
      key: "toggleGrid",
      value: function toggleGrid() {
        this._grid = this.isFull() ? GRID_SPLIT : GRID_FULL;
      }
    }, {
      key: "getSeriesColor",
      value: function getSeriesColor(index) {
        return this.seriesColors[index];
      }
    }, {
      key: "getSeriesName",
      value: function getSeriesName(index) {
        return this.seriesNames[index];
      }
    }, {
      key: "compress",
      value: function compress() {
        var _this = this;

        var params = {
          dataUrl: this.url
        };

        if (Object.keys(this.seriesNames).length) {
          params.seriesNames = this.seriesNames;
        }

        if (Object.keys(this.seriesColors).length) {
          params.seriesColors = this.seriesColors;
        }

        if (!this.isLight()) {
          params.color = this._color;
        }

        if (!this.isFull()) {
          params.grid = this._grid;
        }

        params.charts = this.charts.map(function (chart, i) {
          var compressed = {};
          Object.keys(OPTIONS).forEach(function (option) {
            if (chart[option] && chart[option] !== OPTIONS[option][0]) {
              compressed[option] = chart[option];
            }
          });

          if (chart.title && chart.title !== _this._getDefaultTitle(i)) {
            compressed.title = chart.title;
          }

          if (chart.note) {
            compressed.note = chart.note;
          }

          if (i > 0 && chart.series) {
            compressed.series = chart.series;
          }

          return compressed;
        });

        if (params.charts.length === 1 && !Object.keys(params.charts[0]).length) {
          delete params.charts;
        }

        return params;
      }
    }], [{
      key: "fromJSON",
      value: function fromJSON(data) {
        var params = new ChartParameters(data.dataUrl);
        if (data.charts) params.charts = data.charts;
        if (data.seriesNames) params.seriesNames = data.seriesNames;
        if (data.seriesColors) params.seriesColors = data.seriesColors;
        if (data.grid) params._grid = data.grid;
        if (data.color) params._color = data.color;
        return params;
      }
    }, {
      key: "fromQueryString",
      value: function fromQueryString(qs) {
        var urlParams = utils.parseQueryString(qs);
        var data = urlParams.data;

        if (!data) {
          return null;
        }

        var url = data.csvUrl || data.dataUrl;

        if (!url) {
          return null;
        }

        var params = new ChartParameters(url);
        if (data.charts) params.charts = data.charts;
        if (data.seriesNames) params.seriesNames = data.seriesNames;
        if (data.seriesColors) params.seriesColors = data.seriesColors;
        if (data.grid) params._grid = data.grid;
        if (data.color) params._color = data.color;
        return params;
      }
    }]);

    return ChartParameters;
  }();

  exports.default = ChartParameters;
});