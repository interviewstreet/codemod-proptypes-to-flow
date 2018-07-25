'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transformProperties;

var _propTypeToFlowType = require('./propTypeToFlowType');

var _propTypeToFlowType2 = _interopRequireDefault(_propTypeToFlowType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function transformProperties(j, properties) {
  return properties.map(function (property) {
    var type = (0, _propTypeToFlowType2.default)(j, property.key, property.value);
    type.leadingComments = property.leadingComments;
    type.comments = property.comments;
    return type;
  });
}