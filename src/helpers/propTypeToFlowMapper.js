import { PROPTYPES_IDENTIFIERS } from './constants';

let PropTypeToFlowTypeMap;

/**
 * Injective mapping of PropType member to Flow expression
 */
export function propTypeToFlowTypeMapper(j) {
  if (PropTypeToFlowTypeMap) {
    return PropTypeToFlowTypeMap;
  }

  PropTypeToFlowTypeMap = {
    [PROPTYPES_IDENTIFIERS.ANY]: j.anyTypeAnnotation(),
    [PROPTYPES_IDENTIFIERS.BOOLEAN]: j.booleanTypeAnnotation(),
    [PROPTYPES_IDENTIFIERS.NUMBER]: j.numberTypeAnnotation(),
    [PROPTYPES_IDENTIFIERS.STRING]: j.stringTypeAnnotation(),
    [PROPTYPES_IDENTIFIERS.FUNCTION]: j.genericTypeAnnotation(
      j.identifier('Function'),
      null
    ),
    [PROPTYPES_IDENTIFIERS.OBJECT]: j.genericTypeAnnotation(
      j.identifier('Object'),
      null
    ),
    [PROPTYPES_IDENTIFIERS.ARRAY]: j.genericTypeAnnotation(
      j.identifier('Array'),
      j.typeParameterInstantiation([j.anyTypeAnnotation()])
    ),
    [PROPTYPES_IDENTIFIERS.ELEMENT]: j.genericTypeAnnotation(
      j.qualifiedTypeIdentifier(j.identifier('React'), j.identifier('Element')),
      null
    ),
    [PROPTYPES_IDENTIFIERS.NODE]: j.unionTypeAnnotation([
      j.numberTypeAnnotation(),
      j.stringTypeAnnotation(),
      j.genericTypeAnnotation(
        j.qualifiedTypeIdentifier(
          j.identifier('React'),
          j.identifier('Element')
        ),
        null
      ),
      j.genericTypeAnnotation(
        j.identifier('Array'),
        j.typeParameterInstantiation([j.anyTypeAnnotation()])
      ),
    ]),
  };

  return PropTypeToFlowTypeMap;
}

/**
 * Transformation of referential PropType members to Flow collection
 */
export function propTypeToFlowTypeTransform(j, node, callback) {
  // instanceOf(), arrayOf(), etc..
  const { name } = node.callee.property;

  switch (name) {
    case PROPTYPES_IDENTIFIERS.INSTANCE_OF:
      return j.genericTypeAnnotation(node.arguments[0], null);

    case PROPTYPES_IDENTIFIERS.ARRAY_OF:
      return j.genericTypeAnnotation(
        j.identifier('Array'),
        j.typeParameterInstantiation([
          callback(j, null, node.arguments[0] || j.anyTypeAnnotation()),
        ])
      );

    case PROPTYPES_IDENTIFIERS.OBJECT_OF:
      return j.genericTypeAnnotation(
        j.identifier('Object'),
        j.typeParameterInstantiation([
          callback(j, null, node.arguments[0] || j.anyTypeAnnotation()),
        ])
      );

    case PROPTYPES_IDENTIFIERS.SHAPE:
      return j.objectTypeAnnotation(
        node.arguments[0].properties.map(arg => callback(j, arg.key, arg.value))
      );

    case PROPTYPES_IDENTIFIERS.ONE_OF:
    case PROPTYPES_IDENTIFIERS.ONE_OF_TYPE:
      return j.unionTypeAnnotation(
        node.arguments[0].elements.map(arg => callback(j, null, arg))
      );
    default:
      break;
  }
}

/**
 * Gets the PropType MemberExpression without `React` namespace
 */
export function getPropTypeExpression(j, inputNode) {
  if (
    inputNode.object &&
    inputNode.object.object &&
    inputNode.object.object.name === 'React'
  ) {
    return j.memberExpression(inputNode.object.property, inputNode.property);
  } else if (inputNode.object && inputNode.object.name === 'React') {
    return inputNode.property;
  }
  return inputNode;
}
