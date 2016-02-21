

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (uri) {
  if (uri.host == 'docs.google.com' && uri.pathname && uri.pathname.startsWith('/spreadsheets/d/')) {
    return googledocs(uri);
  }

  if (uri.host == 'dropbox.com' || uri.host == 'www.dropbox.com') {
    return dropbox(uri);
  }

  return uri;
};

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function googledocs(uri) {
  // the gid is the specific sheet within the document
  var hash = uri.hash || '';
  var path = uri.pathname || '';
  var gid = hash.indexOf('gid=') > -1 ? hash.substring(hash.indexOf('gid=') + 4) : 0;
  var doc = path.match(/^\/spreadsheets\/d\/(.*)\//);

  if (doc) doc = doc[1];else return uri; // we couldn't extract document id

  uri.pathname = '/spreadsheets/d/' + doc + '/export';
  uri.query = uri.query || {};
  uri.query.gid = gid;
  uri.query.format = 'csv';
  uri.hash = '';

  // url.format ignores 'query' if 'search' is present
  // (see https://nodejs.org/api/url.html)
  delete uri.search;

  return uri;
}

function dropbox(uri) {
  uri.query = uri.query || {};
  uri.query.raw = 1;
  return uri;
}