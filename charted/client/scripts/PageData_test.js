"use strict";

define(["exports", "./PageData"], function (exports, _PageData) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.testConstructor = testConstructor;
  exports.testIndices_oneColumn = testIndices_oneColumn;

  var _PageData2 = _interopRequireDefault(_PageData);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var DATA = [["month", "example_one", "example_two"], ["2013-07", "2023", "5247"], ["2013-08", "3343", "2357"]];
  var DATA_ONE_COLUMN = [["month"], ["2013-07"], ["2013-08"]];

  function testConstructor(test) {
    var data = new _PageData2.default(DATA);
    test.equal(data.serieses[0].label, "example_one");
    test.equal(data.serieses[0].seriesIndex, 0);
    test.equal(data.serieses[1].label, "example_two");
    test.equal(data.serieses[1].seriesIndex, 1);
    test.equal(data.indices[0], "2013-07");
    test.equal(data.indices[1], "2013-08");
    test.equal(data.data.length, 2);
    test.equal(data.data[0].length, 2);
    test.equal(data.data[0][0].x, 0);
    test.equal(data.data[0][0].xLabel, "2013-07");
    test.equal(data.data[0][0].y, 2023);
    test.equal(data.data[0][0].yRaw, "2023");
    test.equal(data.data[0][1].x, 1);
    test.equal(data.data[0][1].xLabel, "2013-08");
    test.equal(data.data[0][1].y, 3343);
    test.equal(data.data[0][1].yRaw, "3343");
    test.equal(data.data[1].length, 2);
    test.equal(data.data[1][0].x, 0);
    test.equal(data.data[1][0].xLabel, "2013-07");
    test.equal(data.data[1][0].y, 5247);
    test.equal(data.data[1][0].yRaw, "5247");
    test.equal(data.data[1][1].x, 1);
    test.equal(data.data[1][1].xLabel, "2013-08");
    test.equal(data.data[1][1].y, 2357);
    test.equal(data.data[1][1].yRaw, "2357");
    test.done();
  }

  function testIndices_oneColumn(test) {
    var data = new _PageData2.default(DATA_ONE_COLUMN);
    test.equal(data.indices[0], "Row 1");
    test.equal(data.indices[1], "Row 2");
    test.done();
  }
});