"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findIndex;
function findIndex(arr, f) {
  var index = void 0;
  arr.some(function (val, i) {
    var result = f(val, i);
    if (result) {
      index = i;
    }
    return result;
  });

  return index;
}