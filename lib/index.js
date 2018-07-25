'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transformer;

var _es6Classes = require('./transformers/es6Classes');

var _es6Classes2 = _interopRequireDefault(_es6Classes);

var _functional = require('./transformers/functional');

var _functional2 = _interopRequireDefault(_functional);

var _ReactUtils = require('./helpers/ReactUtils');

var _ReactUtils2 = _interopRequireDefault(_ReactUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addFlowComment(j, ast, options) {
  var getBodyNode = function getBodyNode() {
    return ast.find(j.Program).get('body', 0).node;
  };

  var comments = getBodyNode().comments || [];
  var containsFlowComment = comments.filter(function (e) {
    return e.value.indexOf('@flow') !== -1;
  }).length > 0;

  if (!containsFlowComment) {
    switch (options.flowComment) {
      case 'line':
        comments.unshift(j.commentLine(' @flow'));
        break;
      case 'block':
      default:
        comments.unshift(j.commentBlock(' @flow '));
        break;
    }
  }

  getBodyNode().comments = comments;
}

function transformer(file, api, rawOptions) {
  var j = api.jscodeshift;
  var root = j(file.source);

  var options = rawOptions;
  if (options.flowComment !== 'line' && options.flowComment !== 'block') {
    if (options.flowComment) {
      console.warn('Unsupported flowComment value provided: ' + options.flowComment);
      console.warn('Supported options are "block" and "line".');
      console.warn('Falling back to default: "block".');
    }
    options.flowComment = 'block';
  }
  if (!options.propsTypeSuffix) {
    options.propsTypeSuffix = 'Props';
  }

  var reactUtils = (0, _ReactUtils2.default)(j);
  if (!reactUtils.hasReact(root)) {
    return file.source;
  }

  var classModifications = (0, _es6Classes2.default)(root, j, options);
  var functionalModifications = (0, _functional2.default)(root, j, options);

  if (classModifications || functionalModifications) {
    addFlowComment(j, root, options);
    return root.toSource({ quote: 'single', trailingComma: true });
  } else {
    return file.source;
  }
}