"use strict";

define(["exports", "./Actions", "./ChartData", "./ChartLegend", "../shared/utils", "./PageController", "./PageData", "./Editor", "./templates", "./dom"], function (exports, _Actions, _ChartData, _ChartLegend, _utils, _PageController, _PageData, _Editor, _templates, _dom) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _Actions2 = _interopRequireDefault(_Actions);

  var _ChartData2 = _interopRequireDefault(_ChartData);

  var _ChartLegend2 = _interopRequireDefault(_ChartLegend);

  var _PageData2 = _interopRequireDefault(_PageData);

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

  var Chart = function () {
    function Chart(pageController, chartIndex, wrapper, params, data) {
      var _this2 = this;

      _classCallCheck(this, Chart);

      this.pageController = pageController;
      this.wrapper = wrapper;

      // Create initial HTML
      var chartHtmlParameters = {
        editable: pageController.getEditability()
      };

      this.wrapper.innerHTML = templates.chart(chartHtmlParameters);
      this.container = _dom2.default.assert(_dom2.default.get('js-chart', this.wrapper));

      // Cache elements
      this.plot = _dom2.default.assert(_dom2.default.get('js-chartPlot', this.container));
      this.xBeg = _dom2.default.assert(_dom2.default.get('js-xBeg', this.container));
      this.xEnd = _dom2.default.assert(_dom2.default.get('js-xEnd', this.container));
      this.selectionElem = _dom2.default.assert(_dom2.default.get('js-selection', this.container));
      this.selectionXLabel = _dom2.default.assert(_dom2.default.get('js-selectionXLabel', this.container));
      this.selectionYLabel = _dom2.default.assert(_dom2.default.get('js-selectionYLabel', this.container));
      this.selectionValue = _dom2.default.assert(_dom2.default.get('js-selectionValue', this.container));
      this.yAxis = _dom2.default.assert(_dom2.default.get('js-yAxis', this.container));
      this.zeroLine = _dom2.default.assert(_dom2.default.get('js-zeroLine', this.container));
      this.optionsElem = _dom2.default.assert(_dom2.default.get('js-chartOptions', this.container));
      this.chartDescription = _dom2.default.assert(_dom2.default.get('js-chartDescription', this.container));
      this.pageSettings = _dom2.default.assert(_dom2.default.get('js-settings'));

      var chartTitle = _dom2.default.assert(_dom2.default.get('js-chartTitle', this.container));
      this.titleEditor = new _Editor2.default(chartTitle);
      this.titleEditor.onChange(function (content) {
        if (!content) {
          _this2.params.title = _this2.pageController.getDefaultTitle(_this2.chartIndex);
          _this2.titleEditor.setContent(_this2.params.title);
          return;
        }

        _this2.params.title = content;
        _this2.pageController.updateURL();
      });

      var chartNote = _dom2.default.assert(_dom2.default.get('js-chartNote', this.container));
      this.noteEditor = new _Editor2.default(chartNote);
      this.noteEditor.onChange(function (content) {
        _this2.params.note = content;
        _this2.pageController.updateURL();
      });

      // refresh chart and bind interactions
      this.refresh(chartIndex, params, data);
      this.actions = new _Actions2.default(this.container);
      this.bindInteractions();
    }

    // TODO(anton): These should be normal methods


    _createClass(Chart, [{
      key: "activate",
      value: function activate() {
        this.actions.add('toggle-type', this.toggleType, this).add('toggle-rounding', this.toggleRounding, this).activate();
      }
    }, {
      key: "deactivate",
      value: function deactivate() {
        this.actions.deactivate();
        delete this.actions;
      }
    }, {
      key: "refresh",
      value: function refresh(chartIndex, params, data) {
        this.chartIndex = chartIndex;
        this.params = params;
        this.data = new _ChartData2.default(data, this.params.series);

        if (this.legend) {
          this.legend.deactivate();
        }

        this.legend = new _ChartLegend2.default(this.pageController, this.data, this);
        this.legend.activate();

        this.setupChart();
        this.render();
      }
    }, {
      key: "setupChart",
      value: function setupChart() {
        // Clear any existing plot
        this.plot.innerHTML = '';

        // Update chart UI
        this.titleEditor.setContent(this.params.title);
        this.noteEditor.setContent(this.params.note);

        this.xBeg.innerHTML = this.data.getIndexExtent()[0];
        this.xEnd.innerHTML = this.data.getIndexExtent()[1];

        this.setScales();
        this.createChartElements();
      }
    }, {
      key: "setScales",
      value: function setScales() {
        var _this3 = this;

        // set x- and y-axis scales and position functions
        this.xScale = d3.scale.linear().domain([0, this.data.getIndexCount()]);

        this.xPosition = function (d) {
          return Math.floor(_this3.xScale(d.x), 0);
        };
        this.xBarWidth = function (d) {
          // have a pixel space when columns are at least 8px wide
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

        // set stacked and unstacked y ranges
        this.yRangeStacked = this.data.getStackedExtent();
        this.yRangeUnstacked = this.data.getUnstackedExtent();

        // set color scales
        this.colorLight = '#333333';
        this.colorDark = '#FFFFFF';
        this.colorRange = ['#6DCC73', '#1D7775', '#4FCFD5', '#FCE651', '#FF7050', '#FFC050', '#999999'];
      }
    }, {
      key: "createChartElements",
      value: function createChartElements() {
        this.svg = d3.select(this.plot).append('svg');
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
        var plotRect = _dom2.default.rect(this.plot);
        var xBegRect = _dom2.default.rect(this.xBeg);

        this.margin = { top: 4, right: 4, bottom: 0, left: 0 };
        this.width = plotRect.width;
        this.plotWidth = this.width - this.margin.right - this.margin.left;
        this.height = plotRect.height;
        this.svg.attr('width', this.width).attr('height', this.height);
        this.xScale.range([this.margin.left, this.width - this.margin.right - this.margin.left]);
        this.yScale.range([this.height - this.margin.bottom, this.margin.top]);
        this.xEndEdge = _dom2.default.rect(this.xEnd).left - plotRect.left;
        this.xBegEdge = xBegRect.left - plotRect.left + xBegRect.width;
      }
    }, {
      key: "render",
      value: function render() {
        this.updateSizes();

        // apply general rounding and background color
        _dom2.default.classlist.enable(this.container, 'rounding-off', this.params.rounding === 'off');

        // go to last point and refresh chart
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
        _dom2.default.classlist.enable(this.container, 'show-columns', this.params.type === 'column');
        if (this.params.type === 'column') {
          this.yRange = this.yRangeStacked;
          this.focusedSeriesIndex = this.data.getSeriesCount();
        } else {
          this.yRange = this.yRangeUnstacked;

          // focus the series with the max value at the selected point
          var dataAtLastIndex = this.data.getUnstackedValuesAtIndex(this.selectedX);
          this.focusedSeriesIndex = dataAtLastIndex.indexOf(d3.max(dataAtLastIndex)); // TODO
        }

        // yScale range should always include 0, abd add 10% margin for negatives; TODO: make margin pixel based
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

          // plot the dot at the last point
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

        // apply Y axis labels
        var HTML = '';
        var intervals = (0, _utils.getNiceIntervals)(this.yRange, this.height);
        var maxTop = _dom2.default.rect(this.yAxis).height - _dom2.default.rect(this.container).height + 60; // must be 60px below the top
        intervals.forEach(function (interval) {
          interval.top = _this4.yScale(interval.value);
          if (interval.top >= maxTop) {
            interval.display = _this4.params.rounding === 'on' ? interval.displayString : interval.rawString;
            HTML += templates.yAxisLabel(interval);
          }
        });

        this.yAxis.innerHTML = HTML;

        // update zero line position
        _dom2.default.classlist.remove(this.zeroLine, 'hidden');

        var zeroLine = this.zeroLine;
        if (zeroLine instanceof HTMLElement) {
          zeroLine.style.top = this.yScale(0) + "px";
        }
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

        // move selection
        var selectionElem = this.selectionElem;
        if (selectionElem instanceof HTMLElement) {
          selectionElem.style.left = selectionLeft + "px";
        }

        var xLabelRect = _dom2.default.rect(this.selectionXLabel);
        var beg = selectionLeft;
        var end = selectionLeft + xLabelRect.width;

        var onRight = selectionLeft < this.width / 2;
        _dom2.default.classlist.enable(this.selectionElem, 'on-right', onRight);
        if (!onRight) {
          beg = selectionLeft - xLabelRect.width;
          end = selectionLeft;
        }

        // hide x-axis labels if necessary
        _dom2.default.classlist.enable(this.xBeg, 'hidden', beg <= this.xBegEdge);
        _dom2.default.classlist.enable(this.xEnd, 'hidden', end >= this.xEndEdge);

        // move selected dots
        var _this = this;
        this.layers.each(function (seriesIndex, i) {
          var seriesExtent = _this.data.getSeriesExtent(i);
          if (_this.selectedX >= seriesExtent[0] && _this.selectedX <= seriesExtent[1]) {
            d3.select(this).selectAll('.selected-dot').attr('cx', _this.xPositionLine(_this.data.getDatum(i, _this.selectedX))).attr('cy', _this.yPosition(_this.data.getDatum(i, _this.selectedX))).style({ 'opacity': '1' });
          } else {
            d3.select(this).selectAll('.selected-dot').style({ 'opacity': '0' });
          }
        });

        // add selected class to the appropriate columns
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
        // a focusedSeriesIndex >= to the ySeries length means use the total
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

        // update selection
        this.selectionYLabel.innerHTML = thisYLabel;
        this.selectionXLabel.innerHTML = thisPoint.xLabel;
        this.selectionValue.innerHTML = String(thisValueFormatted);

        var label = this.selectionYLabel;
        if (label instanceof HTMLElement) {
          label.style.color = thisYColor;
        }

        var value = this.selectionValue;
        if (value instanceof HTMLElement) {
          value.style.color = thisYColor;
        }
      }
    }, {
      key: "bindInteractions",
      value: function bindInteractions() {
        this.container.addEventListener('mousemove', this.handleMousemove.bind(this));
      }
    }, {
      key: "toggleType",
      value: function toggleType() {
        var options = _PageController.OPTIONS.type;
        this.params.type = this.params.type === options[0] ? options[1] : options[0];
        this.render();
        this.pageController.updateURL();
      }
    }, {
      key: "toggleRounding",
      value: function toggleRounding() {
        var options = _PageController.OPTIONS.rounding;
        this.params.rounding = this.params.rounding === options[0] ? options[1] : options[0];
        this.render();
        this.pageController.updateURL();
      }
    }, {
      key: "handleMousemove",
      value: function handleMousemove(ev) {
        // Show the options
        _dom2.default.classlist.add(this.container, 'active');
        _dom2.default.classlist.add(document.body, 'page-active');

        // don't change the selection if mouseover is below the plot
        var plotRect = _dom2.default.rect(this.plot);
        if (ev.clientY - plotRect.top > plotRect.height) return;

        // update everything if the selextedX or focusedSeriesIndex is different
        var closestPoint = this.getClosestPoint(ev);
        if (closestPoint.selectedX !== this.selectedX || closestPoint.focusedSeriesIndex !== this.focusedSeriesIndex) {
          this.selectedX = closestPoint.selectedX;
          this.focusedSeriesIndex = closestPoint.focusedSeriesIndex;
          this.updatefocusedSeriesIndex();
          this.pageController.updateSelectedX(this.selectedX);
        }
      }
    }, {
      key: "getClosestPoint",
      value: function getClosestPoint(ev) {
        var _this5 = this;

        var plotRect = _dom2.default.rect(this.plot);
        var pixelX = (ev.clientX - plotRect.left) * this.data.getIndexCount() / (this.width - this.margin.right);
        var pixelY = ev.clientY - plotRect.top;
        var currentX = Math.min(Math.floor(Math.max(pixelX, 0)), this.data.getIndexCount() - 1);
        var currentY = this.focusedSeriesIndex;

        // determine the closest y series
        var diffs = d3.range(this.data.getSeriesCount()).map(function (i) {
          var thisDatum = _this5.data.getDatum(i, currentX);
          var indexPixelY = _this5.params.type === 'line' ? _this5.yPosition(thisDatum) : _this5.yPositionStacked(thisDatum);
          var diff = _this5.params.type === 'line' ? Math.abs(pixelY - indexPixelY) : pixelY - indexPixelY;
          var isValid = _this5.params.type === 'line' || diff > 0;
          return { diff: diff, series: i, isValid: isValid };
        });

        diffs = diffs.filter(function (diff) {
          return diff.isValid;
        });
        diffs.sort(function (a, b) {
          return d3.ascending(a.diff, b.diff);
        });
        currentY = diffs.length ? diffs[0].series : 0;

        // use the total if it's a column chart and the mouse position it
        if (this.params.type === 'column') {
          // determine if position is over a y series stack, else show the total
          var yValueExtent = this.data.getStackedExtentForIndex(currentX);
          var yPixelExtent = [this.yScale(yValueExtent[0]), this.yScale(yValueExtent[1])];
          if (pixelY <= yPixelExtent[1] || pixelY > yPixelExtent[0]) {
            currentY = this.data.getSeriesCount();
          }
        }

        return { selectedX: currentX, focusedSeriesIndex: currentY };
      }
    }, {
      key: "updatefocusedSeriesIndex",
      value: function updatefocusedSeriesIndex() {
        if (this.params.type === 'line') {
          var lines = _dom2.default.queryAll('.line', this.container);
          lines.forEach(function (line) {
            return line.className = 'line';
          });

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
      key: "getChartSeries",
      value: function getChartSeries() {
        return this.params.series;
      }
    }]);

    return Chart;
  }();

  exports.default = Chart;
});