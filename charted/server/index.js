

'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _charted = require('./charted');

var _charted2 = _interopRequireDefault(_charted);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = new _db2.default(_path2.default.join(__dirname, '..', '..', '.charted_db'));
_charted2.default.start(Number(process.env.PORT) || 3000, _path2.default.join(__dirname, '..', 'client'), db).then(function (server) {
  server.env.dev = true;
  var address = server.address;
  console.log('Running at ' + address.address + ':' + address.port);
});