"use strict";

define(["exports", "./sha1"], function (exports, _sha) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getFileExtension = exports.getTrimmedExtent = exports.getNiceIntervals = exports.getRoundedValue = exports.stringToNumber = exports.camelToHyphen = exports.parseQueryString = exports.parseChartId = exports.getChartId = undefined;

  var _sha2 = _interopRequireDefault(_sha);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

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
    return (0, _sha2.default)(JSON.stringify(params), true);
  }

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
    var maxOrdersDiff = 2;
    var digitsVisible = 3;
    var ordersLow = log10Floor(Math.abs(extent[1]));
    var ordersHigh = log10Floor(Math.abs(extent[0]));
    var ordersDiff = Math.abs(ordersLow - ordersHigh);
    var ordersMax = Math.max(ordersLow, ordersHigh);
    var ordersToUse = ordersDiff <= maxOrdersDiff ? ordersMax : log10Floor(Math.abs(val));
    return roundToDecimalOrder(val, ordersToUse, digitsVisible);
  }

  function roundToDecimalOrder(val, decimalOrder, digitsVisible) {
    if (decimalOrder < -3) {
      return val.toString();
    } else if (decimalOrder < 3) {
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
    var minDistance = 40;
    var maxTicks = 5;
    var maxPotentialTicks = Math.floor(Math.min(height / minDistance, maxTicks));
    var minInterval = fullRange / maxPotentialTicks;
    var minMultipleOf10 = Math.pow(10, log10Floor(minInterval) + 1);
    var interval = minMultipleOf10;
    [2, 4, 5, 10].forEach(function (divisor) {
      var thisInterval = minMultipleOf10 / divisor;
      interval = thisInterval >= minInterval ? thisInterval : interval;
    });
    var intervalOrders = log10Floor(Math.abs(interval));
    var maxOrders = log10Floor(Math.max(Math.abs(rangeWithZero[0]), Math.abs(rangeWithZero[1])));
    var extraDigit = interval / Math.pow(10, intervalOrders) === 2.5 ? 1 : 0;
    var digitsToUse = 1 + maxOrders - intervalOrders + extraDigit;
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
    var fileStringWithoutParams = fileString.substring(0, fileString.indexOf('?'));
    var fileExtention = fileStringWithoutParams.split('.').pop();
    return fileExtention.toLowerCase();
  }
});