"use strict";

define(["./PageController"], function (_PageController) {

  window.__charted = new _PageController.PageController();

  window.__charted.activate();
});