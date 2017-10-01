"use strict";

define(["exports", "../shared/utils", "./PageData"], function (exports, _utils, _PageData) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _PageData2 = _interopRequireDefault(_PageData);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
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

  var ChartData = function () {
    function ChartData(pageData, seriesIndicesToUse) {
      _classCallCheck(this, ChartData);

      this._data = pageData.data.filter(function (series, i) {
        return seriesIndicesToUse.indexOf(i) > -1;
      });
      this._serieses = pageData.serieses.filter(function (series, i) {
        return seriesIndicesToUse.indexOf(i) > -1;
      });
      this._indices = pageData.indices;
      this.formatData();
    }

    _createClass(ChartData, [{
      key: "formatData",
      value: function formatData() {
        var _this = this;

        // add stackedPosition
        this._data[0].forEach(function (row, i) {
          var negY0 = 0;
          var posY0 = 0;

          _this._data.forEach(function (series, j) {
            var datum = _this._data[j][i];
            datum.ySeries = j;

            if (datum.y < 0) {
              negY0 = negY0 + datum.y;
              datum.y0 = negY0;
              datum.y1 = datum.y0 - datum.y;
            } else {
              datum.y0 = posY0;
              datum.y1 = datum.y0 + datum.y;
              posY0 = posY0 + datum.y;
            }
          });
        });
      }
    }, {
      key: "getFlattenedData",
      value: function getFlattenedData() {
        return this._data.reduce(function (a, b) {
          return a.concat(b);
        });
      }
    }, {
      key: "getSerieses",
      value: function getSerieses() {
        return this._serieses;
      }
    }, {
      key: "getSeries",
      value: function getSeries(i) {
        return this._serieses[i];
      }
    }, {
      key: "getSeriesByIndex",
      value: function getSeriesByIndex(index) {
        for (var i = 0; i < this._serieses.length; i++) {
          if (this._serieses[i].seriesIndex == index) {
            return this._serieses[i];
          }
        }
      }
    }, {
      key: "getSeriesPositionByIndex",
      value: function getSeriesPositionByIndex(index) {
        for (var i = 0; i < this._serieses.length; i++) {
          if (this._serieses[i].seriesIndex == index) {
            return i;
          }
        }

        return -1;
      }
    }, {
      key: "getDatum",
      value: function getDatum(seriesIndex, index) {
        return this._data[seriesIndex][index];
      }
    }, {
      key: "getSeriesLabels",
      value: function getSeriesLabels() {
        return this._serieses.map(function (series) {
          return series.label;
        });
      }
    }, {
      key: "getSeriesIndices",
      value: function getSeriesIndices() {
        return this._serieses.map(function (series) {
          return series.seriesIndex;
        });
      }
    }, {
      key: "getSeriesCount",
      value: function getSeriesCount() {
        return this._serieses.length;
      }
    }, {
      key: "getUnstackedValuesAtIndex",
      value: function getUnstackedValuesAtIndex(i) {
        return this._data.map(function (series) {
          return series[i].y;
        });
      }
    }, {
      key: "getValuesForSeries",
      value: function getValuesForSeries(seriesIndex) {
        var seriesExtent = this.getSeriesExtent(seriesIndex);
        return this._data[seriesIndex].slice(seriesExtent[0], seriesExtent[1] + 1);
      }
    }, {
      key: "getFirstDatum",
      value: function getFirstDatum(seriesIndex) {
        var firstPointIndex = this.getSeriesExtent(seriesIndex)[0];
        return this._data[seriesIndex][firstPointIndex];
      }
    }, {
      key: "getLastDatum",
      value: function getLastDatum(seriesIndex) {
        var lastPointIndex = this.getSeriesExtent(seriesIndex)[1];
        return this._data[seriesIndex][lastPointIndex];
      }
    }, {
      key: "getSeriesExtent",
      value: function getSeriesExtent(seriesIndex) {
        var yRawValues = this._data[seriesIndex].map(function (item) {
          return item.yRaw;
        });
        return (0, _utils.getTrimmedExtent)(yRawValues);
      }
    }, {
      key: "getIndices",
      value: function getIndices() {
        return this._indices;
      }
    }, {
      key: "getIndexCount",
      value: function getIndexCount() {
        return this._indices.length;
      }
    }, {
      key: "getStackedExtent",
      value: function getStackedExtent() {
        return d3.extent(this.getFlattenedData(), function (datum) {
          return datum.y < 0 ? datum.y0 : datum.y1;
        });
      }
    }, {
      key: "getStackedExtentForIndex",
      value: function getStackedExtentForIndex(index) {
        var extent = [0, 0];
        this._data.forEach(function (series) {
          var minOrMax = series[index].y < 0 ? 0 : 1;
          extent[minOrMax] += series[index].y;
        });

        return extent;
      }
    }, {
      key: "getUnstackedExtent",
      value: function getUnstackedExtent() {
        return d3.extent(this.getFlattenedData(), function (datum) {
          return datum.y;
        });
      }
    }, {
      key: "getIndexExtent",
      value: function getIndexExtent() {
        return [this._indices[0], this._indices[this._indices.length - 1]];
      }
    }]);

    return ChartData;
  }();

  exports.default = ChartData;
});