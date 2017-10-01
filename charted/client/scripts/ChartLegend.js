"use strict";

define(["exports", "./Actions", "./Chart", "./ChartData", "./PageController", "./Editor", "./templates", "./dom"], function (exports, _Actions, _Chart, _ChartData, _PageController, _Editor, _templates, _dom) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _Actions2 = _interopRequireDefault(_Actions);

  var _Chart2 = _interopRequireDefault(_Chart);

  var _ChartData2 = _interopRequireDefault(_ChartData);

  var _Editor2 = _interopRequireDefault(_Editor);

  var templates = _interopRequireWildcard(_templates);

  var _dom2 = _interopRequireDefault(_dom);

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

  var ChartLegend = function () {
    function ChartLegend(controller, data, chart) {
      _classCallCheck(this, ChartLegend);

      this.chart = chart;
      this.controller = controller;
      this.data = data;
      this.chartIndex = this.chart.getChartIndex();
      this.series = this.chart.getChartSeries();
      this.actions = new _Actions2.default(this.chart.container);
    }

    _createClass(ChartLegend, [{
      key: "activate",
      value: function activate() {
        this.actions.add('open-color-input', this.openColorInput, this).add('open-move-chart', this.openMoveChart, this).add('move-to-chart', this.moveToChart, this).activate();
      }
    }, {
      key: "deactivate",
      value: function deactivate() {
        this.actions.deactivate();
        delete this.actions;
      }
    }, {
      key: "getLegendElement",
      value: function getLegendElement(index) {
        var legend = _dom2.default.get("js-legendItem[data-series-index=\"" + index + "\"]");
        if (legend) return legend;
        throw "Legend item with index " + index + " not found";
      }
    }, {
      key: "update",
      value: function update() {
        var _this = this;

        if (this.data.getSeriesCount() === 1 && this.controller.getOtherCharts(this.chartIndex).length === 0) {
          var _legend = _dom2.default.get('js-legend', this.chart.container);
          if (_legend) {
            _legend.innerHTML = '';
          }
          return;
        }

        var legend = document.createDocumentFragment();
        var serieses = this.data.getSerieses();

        for (var i = serieses.length - 1; i >= 0; i--) {
          var series = serieses[i];
          var label = this.controller.getSeriesName(this.series[i]);
          var fragment = _dom2.default.renderFragment(templates.legendItem({
            label: label,
            color: this.chart.getSeriesColor(series.seriesIndex),
            editable: this.controller.getEditability(),
            seriesIndex: series.seriesIndex
          }));

          legend.appendChild(fragment);
        }

        var container = _dom2.default.get('js-legend', this.chart.container);
        if (container) {
          container.innerHTML = '';
          container.appendChild(legend);
          _dom2.default.classlist.remove(container, 'hidden');
        }

        var seriesNames = this.controller.params.seriesNames;
        if (this.controller.getEditability()) {
          this.data.getSerieses().forEach(function (series) {
            var label = _dom2.default.get('js-legendLabel', _this.getLegendElement(series.seriesIndex));
            if (!label) throw "Legend label for legend " + series.seriesIndex + " not found";

            var ed = new _Editor2.default(label);
            ed.onChange(function (content) {
              if (!content === '' || content === series.label) {
                ed.setContent(series.label);
                delete seriesNames[series.seriesIndex];
              } else {
                seriesNames[series.seriesIndex] = content;
              }

              _this.controller.updateURL();
            });
          });
        }
      }
    }, {
      key: "openColorInput",
      value: function openColorInput(target) {
        var _this2 = this;

        this.controller.removePopovers();
        var index = Number(target.getAttribute('data-series-index'));
        var el = this.getLegendElement(index);
        var colorHex = this.chart.getSeriesColor(index).replace(/^#/, '');

        _dom2.default.classlist.add(el, 'active-color-input');
        var fragment = _dom2.default.renderFragment(templates.changeSeriesColor({
          colorHex: colorHex,
          seriesIndex: index
        }));
        el.appendChild(fragment);

        // TODO: Replace all this with Editor
        var input = _dom2.default.assert(_dom2.default.get('js-colorEditor', el));
        input.addEventListener('focusout', function () {
          var seriesColors = _this2.controller.params.seriesColors;
          var newColorHex = '';
          if (input.innerText) {
            newColorHex = '#' + input.innerText.replace(/^#/, '').trim();
          }

          var defaultColorHex = _this2.chart.getDefaulSeriesColor(index);
          var isValidHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(newColorHex);

          if (newColorHex === defaultColorHex || !isValidHex) {
            input.innerHTML = defaultColorHex;
            delete seriesColors[index];
          } else {
            seriesColors[index] = newColorHex;
          }
          _this2.chart.render();
          _this2.controller.updateURL();
        });
      }
    }, {
      key: "openMoveChart",
      value: function openMoveChart(target) {
        this.controller.removePopovers();
        var index = Number(target.getAttribute('data-series-index'));
        var series = this.data.getSeriesByIndex(index);
        if (!series) throw "Series " + index + " not found";

        var position = this.data.getSeriesPositionByIndex(index);
        if (position < 0) throw "Series " + index + " not found";

        var otherCharts = this.controller.getOtherCharts(this.chartIndex);

        // current number of charts = other charts + current chart
        var newChartIndex = otherCharts.length + 1;

        if (otherCharts.length === 0) {
          // if no other charts, move series to a new chart
          this.controller.moveToChart(this.series[position], this.chartIndex, newChartIndex);
        } else if (otherCharts.length === 1 && this.series.length === 1) {
          // if only one series and only one other chart, move series back into that chart
          this.controller.moveToChart(this.series[position], this.chartIndex, otherCharts[0].chartIndex);
        } else {
          // else, show all the options in a popover
          var el = this.getLegendElement(series.seriesIndex);
          _dom2.default.classlist.add(el, 'active');

          el.appendChild(_dom2.default.renderFragment(templates.moveChart({
            position: position,
            otherCharts: otherCharts,
            series: this.series,
            newChartIndex: newChartIndex
          })));
        }
      }
    }, {
      key: "moveToChart",
      value: function moveToChart(target) {
        var src = this.chartIndex;
        var dest = Number(target.getAttribute('data-dest'));
        var series = this.series[Number(target.getAttribute('data-position'))];
        this.controller.moveToChart(series, src, dest);
      }
    }]);

    return ChartLegend;
  }();

  exports.default = ChartLegend;
});