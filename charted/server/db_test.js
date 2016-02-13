/*  weak */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tearDown = tearDown;
exports.testInitialize = testInitialize;
exports.testAccess = testAccess;

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _db = require("./db.js");

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PATH = _path2.default.join(__dirname, '..', '..', '.charted_test_db');

function tearDown(callback) {
  _fs2.default.unlinkSync(PATH);
  callback();
}

function testInitialize(test) {
  var db = new _db2.default(PATH);
  db.getAll().then(function (data) {
    test.deepEqual(data, {});
    test.done();
  });
}

function testAccess(test) {
  var db = new _db2.default(PATH);
  db.set('12345', { name: 'Charted' }).then(function () {
    return db.get('12345');
  }).then(function (data) {
    test.equal(data.name, 'Charted');
    test.done();
  });
}