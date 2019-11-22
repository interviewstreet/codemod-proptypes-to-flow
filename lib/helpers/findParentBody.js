"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findParentBody;

var _constants = require("./constants");

function findParentBody(p, memo) {
  if (p.parentPath) {
    if (p.parentPath.name === _constants.IDENTIFIERS.BODY) {
      return {
        child: p.value,
        body: p.parentPath
      };
    }

    return findParentBody(p.parentPath);
  }
}