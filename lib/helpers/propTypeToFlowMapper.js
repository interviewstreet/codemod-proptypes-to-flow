"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.propTypeToFlowTypeMapper = propTypeToFlowTypeMapper;
exports.propTypeToFlowTypeTransform = propTypeToFlowTypeTransform;
exports.getPropTypeExpression = getPropTypeExpression;

var _constants = require("./constants");

let PropTypeToFlowTypeMap;
/**
 * Injective mapping of PropType member to Flow expression
 */

function propTypeToFlowTypeMapper(j) {
  if (PropTypeToFlowTypeMap) {
    return PropTypeToFlowTypeMap;
  }

  PropTypeToFlowTypeMap = {
    [_constants.PROPTYPES_IDENTIFIERS.ANY]: j.anyTypeAnnotation(),
    [_constants.PROPTYPES_IDENTIFIERS.BOOLEAN]: j.booleanTypeAnnotation(),
    [_constants.PROPTYPES_IDENTIFIERS.NUMBER]: j.numberTypeAnnotation(),
    [_constants.PROPTYPES_IDENTIFIERS.STRING]: j.stringTypeAnnotation(),
    [_constants.PROPTYPES_IDENTIFIERS.FUNCTION]: j.genericTypeAnnotation(j.identifier('Function'), null),
    [_constants.PROPTYPES_IDENTIFIERS.OBJECT]: j.genericTypeAnnotation(j.identifier('Object'), null),
    [_constants.PROPTYPES_IDENTIFIERS.ARRAY]: j.genericTypeAnnotation(j.identifier('Array'), j.typeParameterInstantiation([j.anyTypeAnnotation()])),
    [_constants.PROPTYPES_IDENTIFIERS.ELEMENT]: j.genericTypeAnnotation(j.qualifiedTypeIdentifier(j.identifier('React'), j.identifier('Element')), null),
    [_constants.PROPTYPES_IDENTIFIERS.NODE]: j.unionTypeAnnotation([j.numberTypeAnnotation(), j.stringTypeAnnotation(), j.genericTypeAnnotation(j.qualifiedTypeIdentifier(j.identifier('React'), j.identifier('Element')), null), j.genericTypeAnnotation(j.identifier('Array'), j.typeParameterInstantiation([j.anyTypeAnnotation()]))])
  };
  return PropTypeToFlowTypeMap;
}
/**
 * Transformation of referential PropType members to Flow collection
 */


function propTypeToFlowTypeTransform(j, node, callback) {
  // instanceOf(), arrayOf(), etc..
  const {
    name
  } = node.callee.property;

  switch (name) {
    case _constants.PROPTYPES_IDENTIFIERS.INSTANCE_OF:
      return j.genericTypeAnnotation(node.arguments[0], null);

    case _constants.PROPTYPES_IDENTIFIERS.ARRAY_OF:
      return j.genericTypeAnnotation(j.identifier('Array'), j.typeParameterInstantiation([callback(j, null, node.arguments[0] || j.anyTypeAnnotation())]));

    case _constants.PROPTYPES_IDENTIFIERS.OBJECT_OF:
      return j.genericTypeAnnotation(j.identifier('Object'), j.typeParameterInstantiation([callback(j, null, node.arguments[0] || j.anyTypeAnnotation())]));

    case _constants.PROPTYPES_IDENTIFIERS.SHAPE:
      return j.objectTypeAnnotation(node.arguments[0].properties.map(arg => callback(j, arg.key, arg.value)));

    case _constants.PROPTYPES_IDENTIFIERS.ONE_OF:
    case _constants.PROPTYPES_IDENTIFIERS.ONE_OF_TYPE:
      return j.unionTypeAnnotation(node.arguments[0].elements.map(arg => callback(j, null, arg)));

    default:
      break;
  }
}
/**
 * Gets the PropType MemberExpression without `React` namespace
 */


function getPropTypeExpression(j, inputNode) {
  if (inputNode.object && inputNode.object.object && inputNode.object.object.name === 'React') {
    return j.memberExpression(inputNode.object.property, inputNode.property);
  } else if (inputNode.object && inputNode.object.name === 'React') {
    return inputNode.property;
  }

  return inputNode;
}