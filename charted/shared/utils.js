"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFileExtension = exports.getTrimmedExtent = exports.getNiceIntervals = exports.getRoundedValue = exports.stringToNumber = exports.camelToHyphen = exports.parseQueryString = exports.parseChartId = exports.getChartId = undefined;

var _sha = require("./sha1");

var _sha2 = _interopRequireDefault(_sha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.getChartId = getChartId;
exports.parseChartId = parseChartId;
exports.parseQueryString = parseQueryString;
exports.camelToHyphen = camelToHyphen;
exports.stringToNumber = stringToNumber;
exports.getRoundedValue = getRoundedValue;
exports.getNiceIntervals = getNiceIntervals;
exports.getTrimmedExtent = getTrimmedExtent;
exports.getFileExtension = getFileExtension;


function getChartId(params) {
  return (0, _sha2.default)(JSON.stringify(params), /* short */true);
}

/* Returns the Chart ID from a given URL */
function parseChartId(url) {
  var match = /\/(?:c|embed)\/(\w+)(?:|\?.*)?/.exec(url);
  return match ? match[1] : null;
}

function log10Floor(val) {
  return Math.floor(Math.log(val) / Math.LN10, 0);
}

function parseQueryString(qs) {
  var string = qs.slice(1);
  if (!string) return {};

  var queries = string.split("&");
  var params = {};
  queries.forEach(function (query) {
    var pair = query.split("=");
    if (pair.length === 1) {
      params.data = JSON.parse(decodeURIComponent(pair[0]));
    } else {
      params[pair[0]] = pair[1];
    }
  });

  return params;
}

function camelToHyphen(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function stringToNumber(str) {
  return Number(String(str).replace(/[^0-9\.\-]/g, '') || 0);
}

function addCommaSeparator(val) {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getRoundedValue(val, extent) {
  // round to the same decimal if all values are within 2 orders of magnitude (e.g., 10-1,000)
  var maxOrdersDiff = 2;

  // always show 3 digits
  var digitsVisible = 3;

  // find how many orders apart the max/min are to determine how much to round
  var ordersLow = log10Floor(Math.abs(extent[1]));
  var ordersHigh = log10Floor(Math.abs(extent[0]));
  var ordersDiff = Math.abs(ordersLow - ordersHigh);
  var ordersMax = Math.max(ordersLow, ordersHigh);
  var ordersToUse = ordersDiff <= maxOrdersDiff ? ordersMax : log10Floor(Math.abs(val));

  return roundToDecimalOrder(val, ordersToUse, digitsVisible);
}

function roundToDecimalOrder(val, decimalOrder, digitsVisible) {
  if (decimalOrder < -3) {
    // when the val is below 0.001, just show the full value
    return val.toString();
  } else if (decimalOrder < 3) {
    // when the val is from 0.001 to 99, don't show extra decimals
    var roundToDigits = Math.max(digitsVisible - decimalOrder - 1, 0);
    return val.toFixed(roundToDigits);
  }
  var units = ['K', 'M', 'B', 'T'];
  var commasToUse = Math.min(Math.floor(decimalOrder / 3), units.length);
  var divisor = Math.pow(1000, commasToUse);
  var decimals = Math.max(0, commasToUse * 3 - decimalOrder + digitsVisible - 1);
  var thisUnit = units[commasToUse - 1];
  var thisVal = addCommaSeparator((val / divisor).toFixed(decimals));
  return thisVal + thisUnit;
}

function getNiceIntervals(range, height) {
  var rangeWithZero = [Math.min(0, range[0]), Math.max(0, range[1])];
  var fullRange = Math.max(rangeWithZero[1] - rangeWithZero[0]);

  // include no more than 5 ticks spaced at least 50px apart
  var minDistance = 40;
  var maxTicks = 5;
  var maxPotentialTicks = Math.floor(Math.min(height / minDistance, maxTicks));

  // get the smallest nice interval value that produces no more than the max potential ticks
  var minInterval = fullRange / maxPotentialTicks;
  var minMultipleOf10 = Math.pow(10, log10Floor(minInterval) + 1);
  var interval = minMultipleOf10;

  [2, 4, 5, 10].forEach(function (divisor) {
    var thisInterval = minMultipleOf10 / divisor;
    interval = thisInterval >= minInterval ? thisInterval : interval;
  });

  // get the appropriate digits to round the labels
  var intervalOrders = log10Floor(Math.abs(interval));
  var maxOrders = log10Floor(Math.max(Math.abs(rangeWithZero[0]), Math.abs(rangeWithZero[1])));
  var extraDigit = interval / Math.pow(10, intervalOrders) === 2.5 ? 1 : 0; // need extra digit if it's a quarter interval
  var digitsToUse = 1 + maxOrders - intervalOrders + extraDigit;

  // get the intervals
  var niceIntervals = [];
  var firstInterval = Math.ceil(rangeWithZero[0] / interval) * interval;
  var currentInterval = firstInterval;
  while (currentInterval < range[1] + interval) {
    var intervalObject = {
      value: currentInterval,
      displayString: currentInterval === 0 ? '0' : roundToDecimalOrder(currentInterval, maxOrders, digitsToUse),
      rawString: currentInterval === 0 ? '0' : roundToDecimalOrder(currentInterval, Math.min(0, maxOrders), 0)
    };
    currentInterval += interval;
    niceIntervals.push(intervalObject);
  }

  return niceIntervals;
}

function getTrimmedExtent(array) {
  var firstNonEmptyItem = 0;
  var lastNonEmptyItem = 0;

  array.forEach(function (value, i) {
    var isEmpty = !value || value.toLowerCase() === 'null';

    if (isEmpty && i === firstNonEmptyItem) {
      firstNonEmptyItem = i + 1;
    } else if (!isEmpty) {
      lastNonEmptyItem = i;
    }
  });

  return [firstNonEmptyItem, lastNonEmptyItem];
}

function getFileExtension(fileString) {
  // remove any url parameters
  var fileStringWithoutParams = fileString.substring(0, fileString.indexOf('?'));
  var fileExtention = fileStringWithoutParams.split('.').pop();
  return fileExtention.toLowerCase();
}