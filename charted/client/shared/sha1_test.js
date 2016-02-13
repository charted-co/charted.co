'use strict';

define(['exports', './sha1'], function (exports, _sha) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.testSHA1 = testSHA1;

  var _sha2 = _interopRequireDefault(_sha);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function testSHA1(test) {
    test.equal('a9993e364706816aba3e25717850c26c9cd0d89d', (0, _sha2.default)('abc'));
    test.equal('d271a54bb67c1af0ad791924e986cb2ec431f556', (0, _sha2.default)('charted'));
    test.equal('a9993e3', (0, _sha2.default)('abc', true));
    test.equal('d271a54', (0, _sha2.default)('charted', true));
    test.done();
  }
});