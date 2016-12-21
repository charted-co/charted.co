

"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _shelljs = require("shelljs");

var _shelljs2 = _interopRequireDefault(_shelljs);

var _handlebars = require("handlebars");

var _handlebars2 = _interopRequireDefault(_handlebars);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _prepare = require("./prepare");

var _prepare2 = _interopRequireDefault(_prepare);

var _db = require("./db.js");

var _db2 = _interopRequireDefault(_db);

var _sha = require("../shared/sha1");

var _sha2 = _interopRequireDefault(_sha);

var _utils = require("../shared/utils");

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChartedServer = function () {
  _createClass(ChartedServer, null, [{
    key: "start",
    value: function start(port, staticRoot, db) {
      return new Promise(function (resolve) {
        var app = (0, _express2.default)();
        var charted = new ChartedServer(db, staticRoot);

        app.use(_bodyParser2.default.json());
        app.use(_express2.default.static(staticRoot));
        app.get('/c/:id', function (req, res) {
          return charted.getChart(req, res);
        });
        app.get('/embed/:id', function (req, res) {
          return charted.getChart(req, res);
        });
        app.post('/c/:id', function (req, res) {
          return charted.saveChart(req, res);
        });
        app.get('/load', function (req, res) {
          return charted.loadChart(req, res);
        });
        app.get('/oembed', function (req, res) {
          return charted.getOembed(req, res);
        });

        var server = app.listen(port, function () {
          charted.address = server.address();
          resolve(charted);
        });
      });
    }
  }]);

  function ChartedServer(store, staticRoot) {
    _classCallCheck(this, ChartedServer);

    this.store = store;
    this.staticRoot = staticRoot;
    this.env = { dev: false };
  }

  _createClass(ChartedServer, [{
    key: "getChart",
    value: function getChart(req, res) {
      var _this = this;

      this.store.get(req.params.id).then(function (params) {
        if (!params) {
          _this.notFound(res, "chart " + req.params.id + " was not found.");
          return;
        }

        var code = _shelljs2.default.cat(_path2.default.join(__dirname, '..', 'templates', 'index.html'));
        var html = _handlebars2.default.compile(code)({
          ENV: _this.env,
          dataUrl: params.dataUrl
        });

        res.status(200).send(html);
      });
    }
  }, {
    key: "loadChart",
    value: function loadChart(req, res) {
      var _this2 = this;

      if (req.query.url) {
        var _ret = function () {
          var parsed = _url2.default.parse(req.query.url, /* parse query string */true);
          var chartUrl = _url2.default.format((0, _prepare2.default)(parsed));
          var params = { dataUrl: chartUrl };

          _this2.store.set(utils.getChartId(params), params).then(function () {
            return _this2.respondWithChart(res, params);
          });

          return {
            v: undefined
          };
        }();

        if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
      }

      if (req.query.id) {
        this.store.get(req.query.id).then(function (params) {
          if (!params) {
            _this2.notFound(res, "chart " + req.query.id + " was not found.");
            return;
          }

          _this2.respondWithChart(res, params);
        });

        return;
      }

      this.badRequest(res, 'either url or id is required');
      return;
    }
  }, {
    key: "saveChart",
    value: function saveChart(req, res) {
      var id = req.params.id;
      if (utils.getChartId(req.body) != id) {
        this.badRequest(res, 'id and params are out of sync.');
        return;
      }

      this.store.set(id, req.body);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ status: 'ok' }));
    }
  }, {
    key: "getOembed",
    value: function getOembed(req, res) {
      var _this3 = this;

      // oEmbed requires a URL.
      if (!req.query.url) {
        this.badRequest(res, 'URL Required.');
        return;
      }

      // Grab the id from the url.
      var id = utils.parseChartId(req.query.url);

      if (!id) {
        this.badRequest(res, 'Could not parse ID from url');
        return;
      }

      // get the chart.
      this.store.get(id).then(function (params) {
        if (!params) {
          _this3.notFound(res, "chart " + id + " was not found.");
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;

        res.end(JSON.stringify({
          type: 'rich',
          version: '1.0',
          width: 1280,
          height: 600,
          title: "Charted",
          html: "<iframe src=\"https://www.charted.co/embed/" + id + "\" width=\"1280\" height=\"600\" scrolling=\"no\" frameborder=\"0\"></iframe>"
        }));
      });
    }
  }, {
    key: "respondWithChart",
    value: function respondWithChart(res, params) {
      var _this4 = this;

      (0, _request2.default)(params.dataUrl, function (err, resp, body) {
        if (err) {
          _this4.badRequest(res, err);
          return;
        }

        if (resp.statusCode != 200) {
          _this4.badRequest(res, "Received HTTP-" + resp.statusCode + " status code from " + params.dataUrl);
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ params: params, data: body }));
      });
    }
  }, {
    key: "notFound",
    value: function notFound(res, message) {
      res.statusCode = 404;
      res.end("Not Found: " + message);
    }
  }, {
    key: "badRequest",
    value: function badRequest(res, message) {
      res.statusCode = 400;
      res.end("Bad Request: " + message);
    }
  }]);

  return ChartedServer;
}();

exports.default = ChartedServer;