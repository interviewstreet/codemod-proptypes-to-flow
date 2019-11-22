"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transformFunctionalComponents;

var _propTypeToFlowType = _interopRequireDefault(require("../helpers/propTypeToFlowType"));

var _constants = require("../helpers/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function removeComponentAssignmentPropTypes(ast, j) {
  const componentToPropTypesRemoved = {};
  ast.find(j.AssignmentExpression, {
    left: {
      property: {
        name: _constants.IDENTIFIERS.PROPTYPES
      }
    }
  }).forEach(p => {
    const {
      left: {
        object: {
          name: objectName
        }
      },
      right: {
        properties
      }
    } = p.value;
    const flowTypesRemoved = properties.map(property => {
      const t = (0, _propTypeToFlowType.default)(j, property.key, property.value);
      t.comments = property.comments;
      return t;
    });
    componentToPropTypesRemoved[objectName] = flowTypesRemoved;
  }).remove();
  return componentToPropTypesRemoved;
}

function insertTypeIdentifierInFunction(functionPath, j, typeIdentifier) {
  const functionRoot = functionPath.value.init || functionPath.value;
  const {
    params
  } = functionRoot;
  const param = params[0];
  const newTypeAnnotation = j.typeAnnotation(j.genericTypeAnnotation(j.identifier(typeIdentifier), null));

  if (param.type === _constants.NODE_TYPES.IDENTIFIER) {
    param.typeAnnotation = newTypeAnnotation;
  } else if (param.type === _constants.NODE_TYPES.OBJECT_PATTERN) {
    // NOTE: something is wrong with recast and objectPatterns...
    // You cannot set typeAnnotation on them, do object spread instead
    const newProps = j.identifier(_constants.IDENTIFIERS.PROPS);
    newProps.typeAnnotation = newTypeAnnotation;
    functionRoot.params = [newProps];
    const newSpread = j.variableDeclaration(_constants.IDENTIFIERS.CONST, [j.variableDeclarator(param, j.identifier(_constants.IDENTIFIERS.PROPS))]); // if the body of the function is an expression, we need to construct
    // a block statement to hold the props spread

    if (functionRoot.body.type === _constants.EXPRESSION_TYPES.BLOCK_STATEMENT) {
      functionRoot.body.body.unshift(newSpread);
    } else {
      const returnExpression = j.returnStatement(functionRoot.body);
      functionRoot.body = j.blockStatement([newSpread, returnExpression]);
    }
  }
}
/**
 * Transforms function components
 * @return true if any functional components were transformed.
 */


function transformFunctionalComponents(ast, j, options) {
  // Look for Foo.propTypes
  const componentToPropTypesRemoved = removeComponentAssignmentPropTypes(ast, j);
  const components = Object.keys(componentToPropTypesRemoved);

  if (components.length === 0) {
    return null;
  }

  components.forEach(c => {
    const flowTypesRemoved = componentToPropTypesRemoved[c];
    const propIdentifier = components.length === 1 ? options.propsTypeSuffix : `${c}${options.propsTypeSuffix}`;
    const flowTypeProps = j.exportNamedDeclaration(j.typeAlias(j.identifier(propIdentifier), null, j.objectTypeAnnotation(flowTypesRemoved)));
    ast.find(j.FunctionDeclaration, {
      id: {
        name: c
      }
    }).forEach(f => {
      const insertNode = f.parent.node.type === _constants.NODE_TYPES.PROGRAM ? f : f.parent;
      insertNode.insertBefore(flowTypeProps);
      insertTypeIdentifierInFunction(f, j, propIdentifier);
    });
    ast.find(j.VariableDeclarator, {
      id: {
        name: c
      }
    }).forEach(f => {
      const insertNode = f.parent.parent.node.type === _constants.NODE_TYPES.PROGRAM ? f.parent : f.parent.parent;
      insertNode.insertBefore(flowTypeProps);
      insertTypeIdentifierInFunction(f, j, propIdentifier);
    });
  });
  return components.length > 0;
}