"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = propTypeToFlowType;

var _propTypeToFlowMapper = require("./propTypeToFlowMapper");

var _constants = require("./constants");

/**
 * Handles transforming a React.PropType to an equivalent flowtype
 */
function propTypeToFlowType(j, key, value) {
  /**
   * Returns an expression without `isRequired`
   * @param {Node} node NodePath Should be the `value` of a `Property`
   * @return {Object} Object with `required`, and `node`
   */
  const getExpressionWithoutRequired = inputNode => {
    // check if it's required
    let required = false;
    let node = inputNode;

    if (inputNode.property && inputNode.property.name === _constants.PROPTYPES_IDENTIFIERS.IS_REQUIRED) {
      required = true;
      node = inputNode.object;
    }

    return {
      required,
      node
    };
  };

  const TRANSFORM_MAP = (0, _propTypeToFlowMapper.propTypeToFlowTypeMapper)(j);
  let returnValue;
  const expressionWithoutRequired = getExpressionWithoutRequired(value);
  const {
    node,
    required
  } = expressionWithoutRequired; // Check for React namespace for MemberExpressions (i.e. React.PropTypes.string)

  if (node.object) {
    node.object = (0, _propTypeToFlowMapper.getPropTypeExpression)(j, node.object);
  } else if (node.callee) {
    node.callee = (0, _propTypeToFlowMapper.getPropTypeExpression)(j, node.callee);
  }

  switch (node.type) {
    case _constants.NODE_TYPES.STRING_LITERAL:
      returnValue = j.stringLiteralTypeAnnotation(node.value, node.extra.raw);
      break;

    case _constants.NODE_TYPES.IDENTIFIER:
      returnValue = j.genericTypeAnnotation(node, null);
      break;

    case _constants.EXPRESSION_TYPES.MEMBER_EXPRESSION:
      returnValue = TRANSFORM_MAP[node.property.name];
      break;

    case _constants.EXPRESSION_TYPES.CALL_EXPRESSION:
      returnValue = (0, _propTypeToFlowMapper.propTypeToFlowTypeTransform)(j, node, propTypeToFlowType);
      break;

    case _constants.EXPRESSION_TYPES.OBJECT_EXPRESSION:
      returnValue = j.objectTypeAnnotation(node.arguments.map(arg => propTypeToFlowType(j, arg.key, arg.value)));
      break;

    default:
      break;
  } // finally return either an objectTypeProperty or just a property if `key` is null


  if (!key) {
    return returnValue;
  } else {
    return j.objectTypeProperty(key, returnValue, !required);
  }
}