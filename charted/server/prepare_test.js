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
  test.equal(_url2.default.format((0, _prepare2.default)(_url2.default.parse('http://dropbox.com/s/abcdef/my.csv'))), 'http://dropbox.com/s/abcdef/my.csv?raw=1');
  test.equal(_url2.default.format((0, _prepare2.default)(_url2.default.parse('http://www.dropbox.com/s/abcdef/my.csv'))), 'http://www.dropbox.com/s/abcdef/my.csv?raw=1');
  test.done();
}

function testGoogleSpreadsheets(test) {
  test.equal(_url2.default.format((0, _prepare2.default)(_url2.default.parse('https://docs.google.com/spreadsheets/d/1N9Vpl941bR-yN_ZlMHvlc4soDrCxswsORpvjDTbKaiw/edit#gid=2090366728'))), 'https://docs.google.com/spreadsheets/d/1N9Vpl941bR-yN_ZlMHvlc4soDrCxswsORpvjDTbKaiw/export?gid=2090366728&format=csv');
  test.equal(_url2.default.format((0, _prepare2.default)(_url2.default.parse('https://docs.google.com/spreadsheets/d/1N9Vpl941bR-yN_ZlMHvlc4soDrCxswsORpvjDTbKaiw/edit'))), 'https://docs.google.com/spreadsheets/d/1N9Vpl941bR-yN_ZlMHvlc4soDrCxswsORpvjDTbKaiw/export?gid=0&format=csv');
  test.done();
}