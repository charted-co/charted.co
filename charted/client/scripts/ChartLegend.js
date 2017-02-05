"use strict";

define(["exports", "./Chart", "./ChartData", "./PageController", "./Editor", "./templates"], function (exports, _Chart, _ChartData, _PageController, _Editor, _templates) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _Chart2 = _interopRequireDefault(_Chart);

  var _ChartData2 = _interopRequireDefault(_ChartData);

  var _Editor2 = _interopRequireDefault(_Editor);

  var templates = _interopRequireWildcard(_templates);

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
      this.$container = this.chart.getChartContainer();
      this.series = this.chart.getChartSeries();
    }

    _createClass(ChartLegend, [{
      key: "update",
      value: function update() {
        var _this = this;

        if (this.data.getSeriesCount() === 1 && this.controller.getOtherCharts(this.chartIndex).length === 0) {
          this.$container.find('.legend').html('');
          return;
        }

        var $legend = $('');
        var serieses = this.data.getSerieses();

        for (var i = serieses.length - 1; i >= 0; i--) {
          var series = serieses[i];
          var label = this.controller.getSeriesName(this.series[i]);
          var $legendEl = $(templates.legendItem({
            label: label,
            color: this.chart.getSeriesColor(series.seriesIndex),
            editable: this.controller.getEditability()
          }));

          $legend = $legend.add($legendEl);
          series.legendEl = $legendEl;
        }

        this.$container.find('.legend').html($legend).removeClass('hidden');

        var seriesNames = this.controller.params.seriesNames;
        if (this.controller.getEditability()) {
          this.data.getSerieses().forEach(function (series) {
            var el = series.legendEl.find('.js-legendLabel').get(0);
            var ed = new _Editor2.default(el);
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

          this.bindLegendInteractions();
        }
      }
    }, {
      key: "bindLegendInteractions",
      value: function bindLegendInteractions() {
        var _this2 = this;

        this.data.getSerieses().forEach(function (series, i) {
          // open color input
          series.legendEl.find('.legend-color').click(function (event) {
            event.stopPropagation();
            _this2.removePopovers();
            _this2.openColorInput(series);
          });

          // open move-chart popover
          series.legendEl.find('.move-chart').click(function (event) {
            event.stopPropagation();
            _this2.removePopovers();
            _this2.openMoveChart(series, i);
          });
        });

        // remove popovers
        $('html').click(function () {
          return _this2.removePopovers();
        });
      }
    }, {
      key: "openColorInput",
      value: function openColorInput(series) {
        var _this3 = this;

        var colorHex = this.chart.getSeriesColor(series.seriesIndex).replace(/^#/, '');

        series.legendEl.addClass('active-color-input');
        series.legendEl.append(templates.changeSeriesColor({
          colorHex: colorHex,
          seriesIndex: series.seriesIndex
        }));

        this.data.getSeriesIndices().forEach(function (series) {
          var $thisColorInput = _this3.$container.find('.change-series-color-' + series);
          $thisColorInput.on('focusout', function () {

            var seriesColors = _this3.controller.params.seriesColors;
            var newColorHex = '#' + $thisColorInput.text().replace(/^#/, '').trim();

            var defaultColorHex = _this3.chart.getDefaulSeriesColor(series);
            var isValidHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(newColorHex);

            if (newColorHex === defaultColorHex || !isValidHex) {
              $thisColorInput.text(defaultColorHex);
              delete seriesColors[series];
            } else {
              seriesColors[series] = newColorHex;
            }
            _this3.chart.render();
            _this3.controller.updateURL();
          });
        });

        this.$container.find('.change-series-color').click(function (e) {
          return e.stopPropagation();
        });
      }
    }, {
      key: "openMoveChart",
      value: function openMoveChart(series, i) {
        var _this4 = this;

        var otherCharts = this.controller.getOtherCharts(this.chartIndex);

        // current number of charts = other charts + current chart
        var newChartIndex = otherCharts.length + 1;

        if (otherCharts.length === 0) {
          // if no other charts, move series to a new chart
          this.controller.moveToChart(this.series[i], this.chartIndex, newChartIndex);
        } else if (otherCharts.length === 1 && this.series.length === 1) {
          // if only one series and only one other chart, move series back into that chart
          this.controller.moveToChart(this.series[i], this.chartIndex, otherCharts[0].chartIndex);
        } else {
          // else, show all the options in a popover
          series.legendEl.addClass('active');
          series.legendEl.append(templates.moveChart({ otherCharts: otherCharts, series: this.series }));

          otherCharts.forEach(function (chart) {
            _this4.$container.find('.move-to-chart-' + chart.chartIndex).click(function (e) {
              e.preventDefault();
              _this4.controller.moveToChart(_this4.series[i], _this4.chartIndex, chart.chartIndex);
            });
          });

          this.$container.find('.move-to-new-chart').click(function () {
            _this4.controller.moveToChart(_this4.series[i], _this4.chartIndex, newChartIndex);
          });
        }
      }
    }, {
      key: "removePopovers",
      value: function removePopovers() {
        $('html').find('.move-chart-options, .change-series-color').remove();
        $('html').find('.page-settings').removeClass('open');
        $('html').find('.legend-item').removeClass('active active-color-input');
      }
    }]);

    return ChartLegend;
  }();

  exports.default = ChartLegend;
});