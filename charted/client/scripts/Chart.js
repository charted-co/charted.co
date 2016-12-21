"use strict";

define(["exports", "./ChartData", "./ChartLegend", "../shared/utils", "./PageController", "./PageData", "./Editor", "./templates"], function (exports, _ChartData, _ChartLegend, _utils, _PageController, _PageData, _Editor, _templates) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ChartData2 = _interopRequireDefault(_ChartData);

  var _ChartLegend2 = _interopRequireDefault(_ChartLegend);

  var _PageData2 = _interopRequireDefault(_PageData);

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

  var Chart = function () {
    function Chart(pageController, chartIndex, $wrapper, params, data) {
      var _this2 = this;

      _classCallCheck(this, Chart);

      this.pageController = pageController;
      this.$wrapper = $wrapper;
      var chartHtmlParameters = {
        editable: pageController.getEditability()
      };
      this.$wrapper.html(templates.chart(chartHtmlParameters));
      this.$container = $wrapper.find('.chart').first();
      this.$plot = this.$container.find('.chart-plot').first();
      this.$xBeg = this.$container.find('.x-beginning');
      this.$xEnd = this.$container.find('.x-end');
      this.$selectionElem = this.$container.find('.selection');
      this.$selectionXLabel = this.$container.find('.selection-xlabel');
      this.$selectionYLabel = this.$container.find('.selection-ylabel');
      this.$yAxis = this.$container.find('.y-axis');
      this.$zeroLine = this.$container.find('.zero-line');
      this.$selectionValue = this.$container.find('.selection-value');
      this.$optionsElem = this.$container.find('.chart-options');
      this.$pageSettings = $('.page-settings');
      this.$chartDescription = this.$container.find('.chart-description');
      this.titleEditor = new _Editor2.default(this.$container.find('.js-chartTitle').get(0));
      this.titleEditor.onChange(function (content) {
        if (!content) {
          _this2.params.title = _this2.pageController.getDefaultTitle(_this2.chartIndex);

          _this2.titleEditor.setContent(_this2.params.title);

          return;
        }

        _this2.params.title = content;

        _this2.pageController.updateURL();
      });
      this.noteEditor = new _Editor2.default(this.$container.find('.js-chartNote').get(0));
      this.noteEditor.onChange(function (content) {
        _this2.params.note = content;

        _this2.pageController.updateURL();
      });
      this.refresh(chartIndex, params, data);
      this.bindInteractions();
    }

    _createClass(Chart, [{
      key: "refresh",
      value: function refresh(chartIndex, params, data) {
        this.chartIndex = chartIndex;
        this.params = params;
        this.data = new _ChartData2.default(data, this.params.series);
        this.legend = new _ChartLegend2.default(this.pageController, this.data, this);
        this.setupChart();
        this.render();
      }
    }, {
      key: "setupChart",
      value: function setupChart() {
        this.$plot.empty();
        this.titleEditor.setContent(this.params.title);
        this.noteEditor.setContent(this.params.note);
        this.$xBeg.html(this.data.getIndexExtent()[0]);
        this.$xEnd.html(this.data.getIndexExtent()[1]);
        this.setScales();
        this.createChartElements();
      }
    }, {
      key: "setScales",
      value: function setScales() {
        var _this3 = this;

        this.xScale = d3.scale.linear().domain([0, this.data.getIndexCount()]);

        this.xPosition = function (d) {
          return Math.floor(_this3.xScale(d.x), 0);
        };

        this.xBarWidth = function (d) {
          var space = _this3.plotWidth / _this3.data.getIndexCount() >= 8 ? 1 : 0;
          var nextXScale = d.x + 1 < _this3.data.getIndexCount() ? _this3.xScale(d.x + 1) : _this3.plotWidth;
          return Math.floor(nextXScale, 0) - _this3.xPosition(d) - space;
        };

        this.xPositionLine = function (d) {
          return _this3.xPosition(d) + 0.5 * _this3.xBarWidth(_this3.data.getDatum(0, d.x));
        };

        this.yScale = d3.scale.linear();

        this.yPosition = function (d) {
          return _this3.yScale(d.y);
        };

        this.yPositionStacked = function (d) {
          return _this3.yScale(d.y1);
        };

        this.yHeightStacked = function (d) {
          return d.y === 0 ? 0 : _this3.yScale(d.y0) - _this3.yScale(d.y1) + 1;
        };

        this.yRangeStacked = this.data.getStackedExtent();
        this.yRangeUnstacked = this.data.getUnstackedExtent();
        this.colorLight = '#333333';
        this.colorDark = '#FFFFFF';
        this.colorRange = ['#6DCC73', '#1D7775', '#4FCFD5', '#FCE651', '#FF7050', '#FFC050', '#999999'];
      }
    }, {
      key: "createChartElements",
      value: function createChartElements() {
        this.svg = d3.select(this.$plot.get(0)).append('svg');
        this.line = d3.svg.line().interpolate('cardinal').tension(0.96).x(this.xPositionLine).y(this.yPosition);
        this.layerGroup = this.svg.append('g').attr('class', 'layers');
        this.layers = this.layerGroup.selectAll('g').data(this.data.getSeriesIndices()).enter().append('g').attr('class', 'layer');

        var _this = this;

        this.layers.each(function (seriesIndex, i) {
          var layer = d3.select(this);
          layer.append('path').attr('class', 'line').each(function () {
            _this.data.getSeries(i).lineEl = this;
          });
          layer.selectAll('rect').data(_this.data.getValuesForSeries(i)).enter().append('rect').attr('class', 'column').each(function (d) {
            _this.data.getDatum(i, d.x).columnEl = this;
          });
          layer.append('circle').attr('class', 'end-dot last-dot').attr('r', 3);
          layer.append('circle').attr('class', 'end-dot first-dot').attr('r', 3);
          layer.append('circle').attr('class', 'selected-dot').attr('r', 4);
        });
      }
    }, {
      key: "updateSizes",
      value: function updateSizes() {
        this.margin = {
          top: 4,
          right: 4,
          bottom: 0,
          left: 0
        };
        this.width = this.$plot.width();
        this.plotWidth = this.width - this.margin.right - this.margin.left;
        this.height = this.$plot.height();
        this.svg.attr('width', this.width).attr('height', this.height);
        this.xScale.range([this.margin.left, this.width - this.margin.right - this.margin.left]);
        this.yScale.range([this.height - this.margin.bottom, this.margin.top]);
        this.xEndEdge = this.$xEnd.offset().left - this.$plot.offset().left;
        this.xBegEdge = this.$xBeg.offset().left - this.$plot.offset().left + this.$xBeg.width();
      }
    }, {
      key: "render",
      value: function render() {
        this.updateSizes();

        if (this.params.rounding === 'off') {
          this.$container.addClass('rounding-off');
        } else {
          this.$container.removeClass('rounding-off');
        }

        this.selectedX = this.data.getIndexCount() - 1;
        this.applyChartColors();
        this.applyChartType();
        this.updateYAxis();
        this.plotAll();
        this.updateSelectedX();
        this.legend.update();
      }
    }, {
      key: "getDefaulSeriesColor",
      value: function getDefaulSeriesColor(seriesIndex) {
        var seriesIndicies = this.data.getSeriesIndices();

        if (seriesIndicies.length === 1) {
          return this.pageController.params.isLight() ? this.colorLight : this.colorDark;
        }

        var chartSeriesIndex = seriesIndicies.indexOf(seriesIndex);
        var colorCount = this.colorRange.length;
        var seriesColorIndex = chartSeriesIndex % colorCount;
        return this.colorRange[seriesColorIndex];
      }
    }, {
      key: "getSeriesColor",
      value: function getSeriesColor(seriesIndex) {
        return this.pageController.params.getSeriesColor(seriesIndex) || this.getDefaulSeriesColor(seriesIndex);
      }
    }, {
      key: "applyChartColors",
      value: function applyChartColors() {
        var _this = this;

        this.layers.each(function (seriesIndex) {
          var layer = d3.select(this);
          layer.selectAll('.line').attr('stroke', _this.getSeriesColor(seriesIndex));
          layer.selectAll('.column, .selected-column, .selected-dot, .end-dot').attr('fill', _this.getSeriesColor(seriesIndex));
        });
      }
    }, {
      key: "applyChartType",
      value: function applyChartType() {
        if (this.params.type === 'column') {
          this.$container.addClass('show-columns');
          this.yRange = this.yRangeStacked;
          this.focusedSeriesIndex = this.data.getSeriesCount();
        } else {
          this.$container.removeClass('show-columns');
          this.yRange = this.yRangeUnstacked;
          var dataAtLastIndex = this.data.getUnstackedValuesAtIndex(this.selectedX);
          this.focusedSeriesIndex = dataAtLastIndex.indexOf(d3.max(dataAtLastIndex));
        }

        var adjustExtent = function adjustExtent(extent) {
          var min = extent[0] < 0 ? extent[0] * 1.1 : 0;
          return [min, Math.max(0, extent[1])];
        };

        this.yScale.domain(adjustExtent(this.yRange));
      }
    }, {
      key: "plotAll",
      value: function plotAll() {
        var _this = this;

        this.layers.each(function (seriesIndex, i) {
          var layer = d3.select(this);
          layer.selectAll('.column').attr('x', _this.xPosition).attr('y', _this.yPositionStacked).attr('height', _this.yHeightStacked).attr('width', _this.xBarWidth);
          layer.selectAll('.line').attr('d', _this.line(_this.data.getValuesForSeries(i)));

          var firstPoint = _this.data.getFirstDatum(i);

          var lastPoint = _this.data.getLastDatum(i);

          layer.selectAll('.last-dot').attr('cx', _this.xPositionLine(lastPoint)).attr('cy', _this.yPosition(lastPoint));
          layer.selectAll('.first-dot').attr('cx', _this.xPositionLine(firstPoint)).attr('cy', _this.yPosition(firstPoint));
        });
      }
    }, {
      key: "updateYAxis",
      value: function updateYAxis() {
        var _this4 = this;

        var HTML = '';
        var intervals = (0, _utils.getNiceIntervals)(this.yRange, this.height);
        var maxTop = this.$yAxis.height() - this.$container.height() + 60;
        intervals.forEach(function (interval) {
          interval.top = _this4.yScale(interval.value);

          if (interval.top >= maxTop) {
            interval.display = _this4.params.rounding === 'on' ? interval.displayString : interval.rawString;
            HTML += templates.yAxisLabel(interval);
          }
        });
        this.$yAxis.html(HTML);
        this.$zeroLine.removeClass('hidden').css('top', this.yScale(0));
      }
    }, {
      key: "updateSelectedX",
      value: function updateSelectedX(index) {
        if (index != undefined) {
          this.selectedX = index;
        }

        var thisXPosition = this.xPosition(this.data.getDatum(0, this.selectedX));
        var adjust = 0.5 * this.xBarWidth(this.data.getDatum(0, this.selectedX));
        var selectionLeft = thisXPosition + adjust;
        this.$selectionElem.css('left', selectionLeft);
        var beg = selectionLeft;
        var end = selectionLeft + this.$selectionXLabel.width();

        if (selectionLeft < this.width / 2) {
          this.$selectionElem.addClass('on-right');
        } else {
          this.$selectionElem.removeClass('on-right');
          beg = selectionLeft - this.$selectionXLabel.width();
          end = selectionLeft;
        }

        if (beg <= this.xBegEdge) {
          this.$xBeg.addClass('hidden');
        } else {
          this.$xBeg.removeClass('hidden');
        }

        if (end >= this.xEndEdge) {
          this.$xEnd.addClass('hidden');
        } else {
          this.$xEnd.removeClass('hidden');
        }

        var _this = this;

        this.layers.each(function (seriesIndex, i) {
          var seriesExtent = _this.data.getSeriesExtent(i);

          if (_this.selectedX >= seriesExtent[0] && _this.selectedX <= seriesExtent[1]) {
            d3.select(this).selectAll('.selected-dot').attr('cx', _this.xPositionLine(_this.data.getDatum(i, _this.selectedX))).attr('cy', _this.yPosition(_this.data.getDatum(i, _this.selectedX))).style({
              'opacity': '1'
            });
          } else {
            d3.select(this).selectAll('.selected-dot').style({
              'opacity': '0'
            });
          }
        });
        var columns = this.data.getIndexCount();

        for (var i = 0; i < columns; i++) {
          var columnClass = 'column';

          if (_this.selectedX === i) {
            columnClass = 'column selected';
          }

          for (var j = 0; j < _this.data.getSeriesCount(); j++) {
            var el = _this.data.getDatum(j, i).columnEl;

            if (el) {
              d3.select(el).attr('class', columnClass);
            }
          }
        }

        this.updateSelectionText();
      }
    }, {
      key: "updateSelectionText",
      value: function updateSelectionText() {
        var showTotal = this.focusedSeriesIndex >= this.data.getSeriesCount();
        var chartYSeries = showTotal ? this.data.getSeriesCount() - 1 : this.focusedSeriesIndex;
        var thisPoint = this.data.getDatum(chartYSeries, this.selectedX);
        var thisYLabel = '';
        var thisYColor = this.pageController.params.isLight() ? this.colorLight : this.colorDark;

        if (!showTotal) {
          if (thisPoint.ySeries != null) {
            thisYColor = this.getSeriesColor(this.data.getSeries(thisPoint.ySeries).seriesIndex);
          }
        }

        if (this.data.getSeriesCount() > 1) {
          var pageYSeries = this.getChartSeries()[chartYSeries];
          thisYLabel = showTotal ? 'total' : this.pageController.getSeriesName(pageYSeries);
        }

        var seriesExtent = this.data.getStackedExtentForIndex(this.selectedX);
        var seriesTotal = seriesExtent[1] + seriesExtent[0];
        var thisValue = showTotal ? seriesTotal : (0, _utils.stringToNumber)(thisPoint.yRaw);
        var thisValueFormatted = this.params.rounding === 'on' ? (0, _utils.getRoundedValue)(thisValue, this.yRange) : thisValue;
        this.$selectionYLabel.text(thisYLabel).css('color', thisYColor);
        this.$selectionXLabel.text(thisPoint.xLabel);
        this.$selectionValue.text(thisValueFormatted).css('color', thisYColor);
      }
    }, {
      key: "bindInteractions",
      value: function bindInteractions() {
        var _this5 = this;

        Object.keys(_PageController.OPTIONS).forEach(function (option) {
          _this5.$container.find('.toggle-' + option).click(function (event) {
            event.preventDefault();
            var options = _PageController.OPTIONS[option];
            _this5.params[option] = _this5.params[option] === options[0] ? options[1] : options[0];

            _this5.render();

            _this5.pageController.updateURL();
          });
        });
        this.$container.mousemove(function (pixel) {
          return _this5.handleMouseover(pixel);
        });
      }
    }, {
      key: "handleMouseover",
      value: function handleMouseover(pixel) {
        var _this6 = this;

        this.$container.addClass('active');
        $('body').addClass('page-active');

        if (this.mouseTimer) {
          clearTimeout(this.mouseTimer);
          this.mouseTimer = null;
        }

        this.mouseTimer = setTimeout(function () {
          if (_this6.$optionsElem.length && _this6.$optionsElem.is(':hover')) {
            return;
          }

          if (_this6.$chartDescription.length && _this6.$chartDescription.is(':hover')) {
            return;
          }

          if (_this6.$pageSettings.length && _this6.$pageSettings.is(':hover')) {
            return;
          }

          _this6.$container.removeClass('active');

          $('body').removeClass('page-active');

          _this6.$pageSettings.removeClass('open');
        }, 1000);
        if (pixel.pageY - this.$plot.offset().top > this.$plot.height()) return;
        var closestPoint = this.getClosestPoint(pixel);

        if (closestPoint.selectedX !== this.selectedX || closestPoint.focusedSeriesIndex !== this.focusedSeriesIndex) {
          this.selectedX = closestPoint.selectedX;
          this.focusedSeriesIndex = closestPoint.focusedSeriesIndex;
          this.updatefocusedSeriesIndex();
          this.pageController.updateSelectedX(this.selectedX);
        }
      }
    }, {
      key: "getClosestPoint",
      value: function getClosestPoint(pixel) {
        var _this7 = this;

        var pixelX = (pixel.pageX - this.$plot.offset().left) * this.data.getIndexCount() / (this.width - this.margin.right);
        var pixelY = pixel.pageY - this.$plot.offset().top;
        var currentX = Math.min(Math.floor(Math.max(pixelX, 0)), this.data.getIndexCount() - 1);
        var currentY = this.focusedSeriesIndex;
        var diffs = d3.range(this.data.getSeriesCount()).map(function (i) {
          var thisDatum = _this7.data.getDatum(i, currentX);

          var indexPixelY = _this7.params.type === 'line' ? _this7.yPosition(thisDatum) : _this7.yPositionStacked(thisDatum);
          var diff = _this7.params.type === 'line' ? Math.abs(pixelY - indexPixelY) : pixelY - indexPixelY;
          var isValid = _this7.params.type === 'line' || diff > 0;
          return {
            diff: diff,
            series: i,
            isValid: isValid
          };
        });
        diffs = diffs.filter(function (diff) {
          return diff.isValid;
        });
        diffs.sort(function (a, b) {
          return d3.ascending(a.diff, b.diff);
        });
        currentY = diffs.length ? diffs[0].series : 0;

        if (this.params.type === 'column') {
          var yValueExtent = this.data.getStackedExtentForIndex(currentX);
          var yPixelExtent = [this.yScale(yValueExtent[0]), this.yScale(yValueExtent[1])];

          if (pixelY <= yPixelExtent[1] || pixelY > yPixelExtent[0]) {
            currentY = this.data.getSeriesCount();
          }
        }

        return {
          selectedX: currentX,
          focusedSeriesIndex: currentY
        };
      }
    }, {
      key: "updatefocusedSeriesIndex",
      value: function updatefocusedSeriesIndex() {
        if (this.params.type === 'line') {
          this.$container.find('.line').attr('class', 'line');
          var selectedLine = d3.select(this.data.getSeries(this.focusedSeriesIndex).lineEl);
          selectedLine.attr('class', 'line focused');
          d3.select(selectedLine.node().parentNode).each(function () {
            this.parentNode.appendChild(this);
          });
        }
      }
    }, {
      key: "getChartIndex",
      value: function getChartIndex() {
        return this.chartIndex;
      }
    }, {
      key: "getChartContainer",
      value: function getChartContainer() {
        return this.$container;
      }
    }, {
      key: "getChartSeries",
      value: function getChartSeries() {
        return this.params.series;
      }
    }]);

    return Chart;
  }();

  exports.default = Chart;
});