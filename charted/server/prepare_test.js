/*  weak */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.testBasic = testBasic;
exports.testDropbox = testDropbox;
exports.testGoogleSpreadsheets = testGoogleSpreadsheets;

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

var _prepare = require("./prepare.js");

var _prepare2 = _interopRequireDefault(_prepare);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function testBasic(test) {
  var address = 'http://charted.co/';
  var parsed = _url2.default.parse(address);

  test.equal(_url2.default.format((0, _prepare2.default)(parsed)), address);
  test.done();
}

function testDropbox(test) {
  test.equal(parse('http://dropbox.com/s/abcdef/my.csv'), 'http://dropbox.com/s/abcdef/my.csv?raw=1');

  test.equal(parse('http://www.dropbox.com/s/abcdef/my.csv'), 'http://www.dropbox.com/s/abcdef/my.csv?raw=1');

  test.equal(parse('https://www.dropbox.com/s/pbrtd50jpwlx5n8/charted-sample.csv?dl=0'), 'https://www.dropbox.com/s/pbrtd50jpwlx5n8/charted-sample.csv?dl=1');

  test.done();
}

function testGoogleSpreadsheets(test) {
  test.equal(parse('https://docs.google.com/spreadsheets/d/1N9Vpl941bR-yN_ZlMHvlc4soDrCxswsORpvjDTbKaiw/edit#gid=2090366728'), 'https://docs.google.com/spreadsheets/d/1N9Vpl941bR-yN_ZlMHvlc4soDrCxswsORpvjDTbKaiw/export?gid=2090366728&format=csv');

  test.equal(parse('https://docs.google.com/spreadsheets/d/1N9Vpl941bR-yN_ZlMHvlc4soDrCxswsORpvjDTbKaiw/edit'), 'https://docs.google.com/spreadsheets/d/1N9Vpl941bR-yN_ZlMHvlc4soDrCxswsORpvjDTbKaiw/export?gid=0&format=csv');

  // https://github.com/mikesall/charted/issues/77
  test.equal(parse('https://docs.google.com/spreadsheets/d/1i5INeh718Hj2AiKbiRq5eRL5qiekHR9Lzvs4NjCNmtc/edit?usp=sharing'), 'https://docs.google.com/spreadsheets/d/1i5INeh718Hj2AiKbiRq5eRL5qiekHR9Lzvs4NjCNmtc/export?usp=sharing&gid=0&format=csv');

  test.done();
}

function parse(uri) {
  return _url2.default.format((0, _prepare2.default)(_url2.default.parse(uri, true)));
}