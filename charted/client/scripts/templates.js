'use strict';

define(['exports'], function (exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.pageSettings = pageSettings;
  exports.embedOverlay = embedOverlay;
  exports.gridSettingsFull = gridSettingsFull;
  exports.gridSettingsSplit = gridSettingsSplit;
  exports.yAxisLabel = yAxisLabel;
  exports.chart = chart;
  exports.changeSeriesColor = changeSeriesColor;
  exports.legendItem = legendItem;
  exports.moveChart = moveChart;


  function pageSettings() {
    return '\n    <div class="page-settings js-settings">\n      <button class="option-item settings" data-click="open-settings" title="Settings">\n        <span class="icon icon-settings"></span>\n      </button>\n\n      <div class="settings-popover popover">\n        <div class="page-options">\n          <a class="page-option-item js-downloadDataLink" title="Download data">\n            <span class="icon icon-download"></span>Download data\n          </a>\n\n          <button class="page-option-item toggle-color" data-click="toggle-color" title="Switch background color">\n            <span class="icon icon-color"></span>Switch background\n          </button>\n\n          <div class="js-gridOption"></div>\n\n          <button class="page-option-item" data-click="get-embed" title="Get embed code">\n            <span class="icon icon-embed"></span>Get embed code\n          </button>\n\n          <div class="page-data-source">\n            <label>Update data source</label>\n            <div class="page-data-source-form">\n              <input class="js-dataSourceUrl">\n              <button data-click="update-data-source">Go</button>\n            </div>\n          </div>\n        </div>\n\n        <a href="/" class="page-option-item">\n          <span class="icon icon-back"></span>Charted home\n        </a>\n      </div>\n    </div>\n  ';
  }

  function embedOverlay(chartId) {
    var script = '<script src="' + window.location.origin + '/embed.js" data-charted="' + chartId + '"></script>';

    return '\n    <div class="overlay-container js-embedPopup">\n      <div class="overlay-content">\n        <h1 class="overlay-title">Embed this Charted page</h1>\n        <p class="overlay-description">\n          You can add this embed to your website by copying and pasting the HTML code below.\n        </p>\n\n        <textarea class="embed-link">' + script + '</textarea>\n        <div class="iframe-container">' + script + '</div>\n      </div>\n      <div class="overlay-close" data-click="close-embed"><span class="icon icon-x"></span></div>\n    </div>\n  ';
  }

  function gridSettingsFull() {
    return '\n    <button class="page-option-item" data-click="toggle-grid" title="Show full width charts">\n      <span class="icon icon-full-screen"></span>Show full width charts\n    </button>\n  ';
  }

  function gridSettingsSplit() {
    return '\n    <button class="page-option-item" data-click="toggle-grid" title="Show split-screen charts">\n      <span class="icon icon-split-screen"></span>Show split-screen charts\n    </button>\n  ';
  }

  function yAxisLabel(interval) {
    return '\n    <div class="y-axis-label" style="top:' + interval.top + 'px">' + interval.display + '</div>\n  ';
  }

  function chart(params) {
    var editableAttribute = '';
    var editableButtons = '';

    if (params.editable) {
      editableAttribute = 'contenteditable="true"';
      editableButtons = '\n      <div class="chart-options js-chartOptions">\n        <a class="option-item toggle-type" data-click="toggle-type" href="#" title="Switch chart type">\n          <span class="icon icon-line"></span>\n          <span class="icon icon-column"></span>\n        </a>\n\n        <a class="option-item toggle-rounding" data-click="toggle-rounding" href="#" title="Turn rounding on/off">\n          <span class="icon icon-round-off"></span>\n          <span class="icon icon-round-on"></span>\n        </a>\n      </div>\n    ';
    }

    return '\n    <div class="chart js-chart show-columns">\n      <div class="chart-description js-chartDescription">\n        <h1 class="js-chartTitle title info-input" ' + editableAttribute + '></h1>\n        <div class="js-chartNote note info-input" ' + editableAttribute + '></div>\n      </div>\n\n      <div class="chart-plot-outer-container">\n        <div class="chart-plot-inner-container">\n          <div class="y-axis-container"><div class="y-axis js-yAxis chart-height"></div></div>\n          <div class="zero-line-container chart-height"><div class="zero-line js-zeroLine"></div></div>\n          <div class="x-axis"><span class="js-xBeg x-beginning"></span><span class="js-xEnd x-end"></span></div>\n          <div class="selection js-selection">\n            <div class="selection-info">\n              <div class="selection-value js-selectionValue"></div>\n              <div class="selection-xlabel js-selectionXLabel"></div>\n              <div class="selection-ylabel js-selectionYLabel"></div>\n            </div>\n          </div>\n          <figure class="chart-plot chart-height js-chartPlot"></figure>\n        </div>\n      </div>\n\n      <aside class="chart-info">\n        <ul class="legend js-legend hidden"></ul>\n        ' + editableButtons + '\n      </aside>\n    </div>\n  ';
  }

  function changeSeriesColor(params) {
    return '\n    <div class="change-series-color popover js-changeSeriesColor">\n      <p>Change color:</p>\n      <p>\n        <span contenteditable="true" class="color-hex-input js-colorEditor">' + params.colorHex + '</span>\n      </p>\n      <span class="arrow-bottom-left"></span>\n    </div>\n  ';
  }

  function legendItem(label) {
    var editableAttribute = '';
    var editableButtons = '';

    if (label.editable) {
      editableAttribute = 'contenteditable="true"';
      editableButtons = '\n      <button class="move-chart" data-click="open-move-chart" data-series-index="' + label.seriesIndex + '">\n        <span class="icon icon-move"></span>\n      </button>';
    }

    return '\n    <li class="legend-item js-legendItem" data-series-index="' + label.seriesIndex + '">\n      <div class="legend-label info-input">\n        <span class="legend-input js-legendLabel" ' + editableAttribute + '>' + label.label + '</span>\n      </div>\n      <button class="legend-color" data-click="open-color-input" data-series-index="' + label.seriesIndex + '">\n        <span style="background-color:' + label.color + ';" class="legend-dot"></span>\n      </button>\n      ' + editableButtons + '\n    </li>\n  ';
  }

  function moveChart(params) {
    var chartList = params.otherCharts.map(function (chart) {
      return '\n      <a href= "#" class="move-chart-option" data-click="move-to-chart" data-dest="' + chart.chartIndex + '" data-position="' + params.position + '">\n        ' + chart.title + '\n      </a>\n    ';
    }).join('\n');

    var newChartButton = '';
    if (params.series.length > 1) {
      newChartButton = '\n      <a href= "#" class="move-chart-option" data-click="move-to-chart" data-dest="' + params.newChartIndex + '" data-position="' + params.position + '">\n        <span class="icon icon-plus"></span>New chart\n      </a>\n    ';
    }

    return '\n    <div class="move-chart-options popover js-moveChartOptions">\n      <p>Move to:</p>\n      ' + chartList + '\n      ' + newChartButton + '\n      <span class="arrow-bottom-right"></span>\n    </div>\n  ';
  }
});