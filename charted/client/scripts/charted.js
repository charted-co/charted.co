"use strict";

define(["./PageController"], function (_PageController) {
  $(function () {
    var pageController = new _PageController.PageController();
    pageController.activate();
  });
});