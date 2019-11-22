"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transformProperties;

var _propTypeToFlowType = _interopRequireDefault(require("./propTypeToFlowType"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function transformProperties(j, properties) {
  return properties.map(property => {
    const type = (0, _propTypeToFlowType.default)(j, property.key, property.value);
    type.leadingComments = property.leadingComments;
    type.comments = property.comments;
    return type;
  });
}