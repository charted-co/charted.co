"use strict";

define(["./PageData_test", "./ChartParameters_test", "../shared/sha1_test"], function (_PageData_test, _ChartParameters_test, _sha1_test) {
  var tests_PageData = _interopRequireWildcard(_PageData_test);

  var tests_ChartParameters = _interopRequireWildcard(_ChartParameters_test);

  var tests_sha1 = _interopRequireWildcard(_sha1_test);

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

  nodeunit.run({
    'PageData': tests_PageData,
    'ChartParameters': tests_ChartParameters,
    'sha1': tests_sha1
  });
});