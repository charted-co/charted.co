"use strict";

define(["exports", "./PageData", "./Chart", "./ChartParameters", "./templates", "../shared/utils"], function (exports, _PageData, _Chart, _ChartParameters, _templates, _utils) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.PageController = exports.OPTIONS = undefined;

  var _PageData2 = _interopRequireDefault(_PageData);

  var _Chart2 = _interopRequireDefault(_Chart);

  var _ChartParameters2 = _interopRequireDefault(_ChartParameters);

  var templates = _interopRequireWildcard(_templates);

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

  var MIN_30 = 1000 * 60 * 30;
  var OPTIONS = exports.OPTIONS = {
    // Default values are first
    type: ['column', 'line'],
    rounding: ['on', 'off']
  };

  var PageController = exports.PageController = function () {
    function PageController() {
      var _this = this;

      _classCallCheck(this, PageController);

      this.isEmbed = false;
      this.chartObjects = [];
      this.$body = $('body');
      this.$charts = $('.charts');

      // re-render charts on window resize
      $(window).resize(function () {
        clearTimeout(_this.resizeTimer);
        _this.resizeTimer = setTimeout(function () {
          return _this.setDimensions();
        }, 30);
      });

      // setup keystrokes
      $(document).keyup(function (ev) {
        if (ev.keyCode == 27) {
          $('.overlay-container').remove();
          $('.page-settings').removeClass('open');
        }
      });

      $('.load-data-form').submit(function (ev) {
        ev.preventDefault();

        var url = $('.data-file-input').val();
        if (!url) {
          var err = 'You’ll need to paste in the URL to a .csv file or Google Spreadsheet first.';
          _this.errorNotify(new Error(err));
          return;
        }

        _this.fetchPageData(url, /* id */null, /* params */null);
      });
    }

    _createClass(PageController, [{
      key: "activate",
      value: function activate() {
        var _this2 = this;

        var path = /\/(c|embed)\/([a-z\d]{7})\/?$/.exec(window.location.pathname);
        var chartId = path && path[2];
        var legacyParams = _ChartParameters2.default.fromQueryString(window.location.search || '');

        if (!chartId && !legacyParams) {
          this.clearExisting();
          this.$body.addClass('pre-load');
          return;
        }

        this.isEmbed = path && path[1] == 'embed';

        // If it's not an embed, refresh every 30 minutes (1000 * 60 * 30)
        if (!this.isEmbed) {
          setInterval(function () {
            return _this2.fetchPageData();
          }, MIN_30);
        }

        if (chartId) {
          this.fetchPageData( /* url */null, chartId, /* params */null);
          return;
        }

        // We need to convert legacy params by saving them into the database and
        // then fetch data.
        if (legacyParams) {
          (function () {
            _this2.params = legacyParams.withDefaultTitle(function (i) {
              return _this2.getDefaultTitle(i);
            });
            var legacyParamsCompressed = _this2.params.compress();
            var legacyDataUrl = legacyParamsCompressed.dataUrl || null;
            _this2.updateURL( /* withoutServerUpdate */false, function () {
              return _this2.fetchPageData(legacyDataUrl, /* id */null, legacyParamsCompressed);
            });
          })();
        }
      }

      /**
       * Fetches chart data and parameters either by URL or by ID.
       */

    }, {
      key: "fetchPageData",
      value: function fetchPageData(dataUrl, id, params) {
        var _this3 = this;

        if (!dataUrl && !id) {
          if (!this.params) {
            return;
          }

          // If neither dataUrl nor id is provided but there is an
          // active chart, we simply refetch that chart.
          id = utils.getChartId(this.params.compress());
        }

        this.$body.addClass('loading');
        this.updatePageTitle('Charted (...)');
        this.clearExisting();

        if (dataUrl) {
          $('.data-file-input').val(dataUrl);
        }
        var url = "/load/?url=" + encodeURIComponent(dataUrl || '') + "&id=" + encodeURIComponent(id || '');
        d3.json(url, function (err, resp) {
          if (err) {
            _this3.errorNotify(err);
            return;
          }

          if (!resp.data || !resp.data.length) {
            _this3.errorNotify(new Error('Missing data from source: ' + resp.params.dataUrl));
            return;
          }

          var paramsToUse = params ? params : resp.params;
          paramsToUse.dataUrl = resp.params.dataUrl;
          _this3.params = _ChartParameters2.default.fromJSON(paramsToUse).withDefaultTitle(function (i) {
            return _this3.getDefaultTitle(i);
          });
          _this3.data = new _PageData2.default.fromJSON(_this3.params.url, resp.data);
          _this3.render();
        });
      }

      /**
       * Renders charts
       */

    }, {
      key: "render",
      value: function render() {
        var _this4 = this;

        // Set background color
        var color = this.params.isLight() ? 'light' : 'dark';
        this.$body.addClass(color);

        // Set embed style
        this.applyEmbed();

        this.setupPageSettings();

        // set first title
        if (!this.params.charts[0].title) {
          this.params.charts[0].title = this.data.serieses.length > 1 ? 'Chart' : this.data.serieses[0].label;
        }

        this.$body.removeClass('pre-load loading error');

        // update charts
        this.params.charts.forEach(function (chart, i) {
          return _this4.updateChart(i);
        });

        this.setDimensions();
        this.updateURL();
        $('.data-source-url').val(this.params.url);
      }
    }, {
      key: "clearExisting",
      value: function clearExisting() {
        $('.chart-wrapper, .page-settings').remove();
        this.chartObjects = [];
        $('body, .settings, .settings-popover, .toggle-color').unbind();
      }
    }, {
      key: "setupPageSettings",
      value: function setupPageSettings() {
        var _this5 = this;

        // if this is an embed, don't add the page settings
        if (this.isEmbed) return;

        // populate UI
        this.$body.append(templates.pageSettings());
        var $pageSettings = this.$body.find('.page-settings');

        $('.download-data').attr('href', this.params.url);
        $('.data-source-url').val(this.params.url);

        // bind intereactions
        $pageSettings.find('.settings').click(function (event) {
          event.stopPropagation();
          $pageSettings.addClass('open');
        });

        $pageSettings.find('.settings-popover').click(function (event) {
          return event.stopPropagation();
        });

        this.$body.click(function () {
          return $pageSettings.removeClass('open');
        });

        $pageSettings.find('.toggle-color').click(function () {
          return _this5.toggleColor();
        });
        $pageSettings.find('.get-embed').click(function () {
          return _this5.getEmbed();
        });
        $pageSettings.find('.update-data-source').click(function () {
          return _this5.fetchPageData($('.data-source-url').val(), /* id */null, _this5.params);
        });
      }
    }, {
      key: "updateChart",
      value: function updateChart(chartIndex) {
        var chartParams = this.getFullParams(chartIndex);

        // determine what to do with chart
        if (chartParams.series.length === 0) {
          // if there are no series, remove it
          this.removeChart(chartIndex);
        } else if (chartIndex <= this.chartObjects.length - 1) {
          // if it already exists, refresh it
          this.chartObjects[chartIndex].refresh(chartIndex, chartParams, this.data);
        } else {
          // if it doesn't exist yet, create it
          this.createNewChart(chartIndex, this.getFullParams(chartIndex));
        }
      }
    }, {
      key: "getFirstChartSeries",
      value: function getFirstChartSeries() {
        var otherChartSeries = [];
        var firstChartSeries = [];

        for (var i = 1; i < this.params.charts.length; i++) {
          otherChartSeries = otherChartSeries.concat(this.params.charts[i].series);
        }

        for (var j = 0; j < this.data.serieses.length; j++) {
          if (otherChartSeries.indexOf(j) > -1) continue;
          firstChartSeries.push(j);
        }

        return firstChartSeries;
      }
    }, {
      key: "createNewChart",
      value: function createNewChart(thisChartIndex, initialChartParams) {
        var $el = $('<div class="chart-wrapper"></div>');
        var dimensions = this.getChartDimensions();
        $el.outerHeight(dimensions.height).outerWidth(dimensions.width);
        this.$charts.append($el);
        this.chartObjects.push(new _Chart2.default(this, thisChartIndex, $el, initialChartParams, this.data));
      }
    }, {
      key: "moveToChart",
      value: function moveToChart(series, fromChartIndex, toChartIndex) {
        var _this6 = this;

        var fromChart = this.params.charts[fromChartIndex];
        var toChart = this.params.charts[toChartIndex];

        // remove default titles
        this.params.charts.forEach(function (chart, i) {
          if (chart.title && chart.title == _this6.getDefaultTitle(i)) {
            delete chart.title;
          }
        });

        // add series to intended chart
        if (toChartIndex > this.params.charts.length - 1) {
          this.params.charts.push({ series: [series] });
        } else if (toChartIndex > 0) {
          toChart.series.push(series);
          toChart.series.sort(function (a, b) {
            return a - b;
          });
        }

        // remove series from initial chart
        if (fromChartIndex > 0) {
          fromChart.series = fromChart.series.filter(function (listedSeries) {
            return listedSeries !== series;
          });
        }

        this.updateChart(toChartIndex);

        $('html, body').animate({
          scrollTop: this.chartObjects[toChartIndex].$wrapper.offset().top
        }, 300);

        this.updateChart(fromChartIndex);

        // update all charts that come after, since default titles may have changed
        for (var j = fromChartIndex; j < this.chartObjects.length; j++) {
          if (j === toChartIndex) continue;
          this.updateChart(j);
        }

        this.setDimensions();
        this.updateURL();
      }
    }, {
      key: "removeChart",
      value: function removeChart(chartIndex) {
        // need to increment down the chartIndex for every chart that comes after
        for (var i = chartIndex + 1; i < this.chartObjects.length; i++) {
          this.chartObjects[i].chartIndex--;
        }

        // remove the parameters, html element, and overall chart object
        this.params.charts.splice(chartIndex, 1);
        this.chartObjects[chartIndex].$wrapper.remove();
        this.chartObjects.splice(chartIndex, 1);
      }
    }, {
      key: "getFullParams",
      value: function getFullParams(chartIndex) {
        var params = this.params.charts[chartIndex];
        Object.keys(OPTIONS).forEach(function (option) {
          params[option] = params[option] || OPTIONS[option][0];
        });

        if (chartIndex === 0) {
          params.series = this.getFirstChartSeries();
        }

        params.title = params.title || this.getDefaultTitle(chartIndex);

        return params;
      }
    }, {
      key: "getDefaultTitle",
      value: function getDefaultTitle(chartIndex) {
        var series = this.params.charts[chartIndex].series;
        if (!series || !this.data) {
          return 'Charted';
        } else if (series.length === 1) {
          return this.getSeriesName(series[0]);
        }
        var earlierCharts = this.params.charts.filter(function (chart, i) {
          return chart.series.length > 0 && i < chartIndex;
        });
        return chartIndex === 0 ? 'Chart' : 'Chart ' + (1 + earlierCharts.length);
      }
    }, {
      key: "getSeriesName",
      value: function getSeriesName(i) {
        return this.params.getSeriesName(i) || this.data.serieses[i].label;
      }
    }, {
      key: "getChartCount",
      value: function getChartCount() {
        return this.params.charts.length;
      }
    }, {
      key: "getOtherCharts",
      value: function getOtherCharts(chartIndex) {
        var _this7 = this;

        return this.params.charts.map(function (chart, i) {
          return {
            title: chart.title || _this7.getDefaultTitle(i),
            chartIndex: i
          };
        }).filter(function (chart, i) {
          return i !== chartIndex;
        });
      }
    }, {
      key: "updateSelectedX",
      value: function updateSelectedX(index) {
        this.chartObjects.forEach(function (chart) {
          chart.updateSelectedX(index);
        });
      }
    }, {
      key: "toggleColor",
      value: function toggleColor() {
        this.params.toggleColor();
        this.$body.toggleClass('dark');
        this.chartObjects.forEach(function (chart) {
          chart.render();
        });
        this.updateURL();
      }
    }, {
      key: "toggleGrid",
      value: function toggleGrid() {
        this.params.toggleGrid();
        this.applyGrid();
        this.setDimensions();
        this.updateURL();
      }
    }, {
      key: "applyGrid",
      value: function applyGrid() {
        var _this8 = this;

        this.$body.toggleClass('full');

        var template = templates.gridSettingsFull;
        if (this.params && this.params.isFull()) {
          template = templates.gridSettingsSplit;
        }

        var chartCount = this.chartObjects ? this.chartObjects.length : 0;
        $('.grid-option').html(chartCount > 1 ? template() : '');
        $('.toggle-grid').click(function () {
          return _this8.toggleGrid();
        });
      }
    }, {
      key: "getEmbed",
      value: function getEmbed() {
        var params = this.params.compress();
        var chartId = utils.getChartId(params);

        this.$body.append(templates.embedOverlay(chartId));
        this.$body.find('.overlay-content').click(function (ev) {
          return ev.stopPropagation();
        });
        this.$body.click(function () {
          return $('.overlay-container').remove();
        });
      }
    }, {
      key: "applyEmbed",
      value: function applyEmbed() {
        if (this.params.embed) {
          this.$body.addClass('embed');
        } else {
          this.$body.removeClass('embed');
        }
      }
    }, {
      key: "getEditability",
      value: function getEditability() {
        return !this.isEmbed;
      }
    }, {
      key: "getChartDimensions",
      value: function getChartDimensions() {
        // get all values to use
        var minHeightForHalfHeight = 600;
        var minWidthForHalfWidth = 1200;
        var minWidthForFullHeight = 800;
        var windowWidth = $(window).innerWidth();
        var windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
        var defaultHeight = windowWidth > minWidthForFullHeight ? windowHeight : 'auto';
        var chartCount = this.chartObjects ? this.chartObjects.length : 0;

        // check conditions for adjusting dimensions
        var useHalfWidth = chartCount >= 2 && windowWidth > minWidthForHalfWidth && !this.params.isFull();
        var enoughHeightForHalfHeight = windowHeight > minHeightForHalfHeight && windowWidth > minWidthForFullHeight;
        var enoughChartsForHalfHeight = chartCount >= 3 || chartCount === 2 && !useHalfWidth;
        var useHalfHeight = enoughHeightForHalfHeight && enoughChartsForHalfHeight;

        return {
          width: useHalfWidth ? windowWidth / 2 : windowWidth,
          height: useHalfHeight ? windowHeight / 2 : defaultHeight,
          isHalfHeight: useHalfHeight,
          isGrid: useHalfWidth
        };
      }
    }, {
      key: "setDimensions",
      value: function setDimensions() {
        var dimensions = this.getChartDimensions();
        if (dimensions.isGrid) {
          this.$body.addClass('chart-grid');
          this.$body.removeClass('half-height');
        } else if (dimensions.isHalfHeight) {
          this.$body.removeClass('chart-grid');
          this.$body.addClass('half-height');
        } else {
          this.$body.removeClass('chart-grid half-height');
        }
        $('.chart-wrapper').outerHeight(dimensions.height).outerWidth(dimensions.width);

        var bottomRowIndex = Math.floor((this.chartObjects.length - 1) / 2) * 2;
        this.chartObjects.forEach(function (chart, i) {
          if (dimensions.isGrid && i >= bottomRowIndex) {
            chart.$wrapper.addClass('bottom-row');
          } else {
            chart.$wrapper.removeClass('bottom-row');
          }
          chart.render();
        });

        this.applyGrid();
        this.maybeBroadcastDimensions();
      }
    }, {
      key: "maybeBroadcastDimensions",
      value: function maybeBroadcastDimensions() {
        if (!this.isEmbed) {
          return;
        }

        // Charted does a redirect away from the /embed/:id url, so we need to recreate the embed URL.
        var src = window.location.toString().replace('/c/', '/embed/');

        // scrollHeight is not great as the embed can never get shorter. This is a short term
        // fix to deal with this fact.
        var height = document.body.scrollHeight;
        height = height > 600 && document.body.offsetWidth >= 800 ? 600 : height;

        // Going to send a modified version of the standard resize context.
        var message = {
          chartId: utils.getChartId(this.params.compress()),
          src: src,
          context: "iframe.resize",
          height: height
        };

        if (window.parent) {
          window.parent.postMessage(JSON.stringify(message), '*' /* Any site can embed charted */);
        }
      }
    }, {
      key: "errorNotify",
      value: function errorNotify(error) {
        this.$body.addClass('error').removeClass('loading');
        this.updatePageTitle();
        var displayMessage = error.message || error.responseText || 'There’s been an error. Please check that ' + 'you are using a valid .csv file. If you are using a Google Spreadsheet or Dropbox ' + 'link, the privacy setting must be set to shareable.';

        $('.error-message').html(displayMessage);
      }
    }, {
      key: "updateURL",
      value: function updateURL() {
        var withoutServerUpdate = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
        var cb = arguments[1];

        this.updatePageTitle();
        var params = this.params.compress();
        var chartId = utils.getChartId(params);
        var path = "/c/" + chartId;
        window.history.pushState({}, null, path);

        if (!withoutServerUpdate) {
          d3.xhr(path).header('Content-Type', 'application/json').post(JSON.stringify(params), function () {
            if (cb) cb();
          });
          // TODO (anton): Show an error if save failed
        }
      }
    }, {
      key: "updatePageTitle",
      value: function updatePageTitle(pageTitleString) {
        var _this9 = this;

        var pageTitle = 'Charted';
        var charts = [];
        if (this.params && this.params.charts) {
          charts = this.params.charts;
        }

        if (pageTitleString) {
          pageTitle = pageTitleString;
        } else if (charts.length > 0) {
          // if there's a chart, use the chart titles
          pageTitle = charts.map(function (chart, i) {
            return chart.title || _this9.getDefaultTitle(i);
          }).join(', ');

          // if it's just one chart called "Chart", add the series names
          if (pageTitle === 'Chart') {
            pageTitle += ' of ' + charts[0].series.map(function (series) {
              return _this9.getSeriesName(series);
            }).join(', ');
          }
        }

        document.title = pageTitle;
      }
    }]);

    return PageController;
  }();
});