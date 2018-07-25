'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transformFunctionalComponents;

var _propTypeToFlowType = require('../helpers/propTypeToFlowType');

var _propTypeToFlowType2 = _interopRequireDefault(_propTypeToFlowType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function removeComponentAssignmentPropTypes(ast, j) {
  var componentToPropTypesRemoved = {};

  ast.find(j.AssignmentExpression, {
    left: {
      property: {
        name: 'propTypes'
      }
    }
  }).forEach(function (p) {
    var objectName = p.value.left.object.name;
    var properties = p.value.right.properties;
    var flowTypesRemoved = properties.map(function (property) {
      var t = (0, _propTypeToFlowType2.default)(j, property.key, property.value);
      t.comments = property.comments;
      return t;
    });

    componentToPropTypesRemoved[objectName] = flowTypesRemoved;
  }).remove();

  return componentToPropTypesRemoved;
}

function insertTypeIdentifierInFunction(functionPath, j, typeIdentifier) {
  var functionRoot = functionPath.value.init || functionPath.value;

  var params = functionRoot.params;
  var param = params[0];

  var newTypeAnnotation = j.typeAnnotation(j.genericTypeAnnotation(j.identifier(typeIdentifier), null));

  if (param.type === 'Identifier') {
    param.typeAnnotation = newTypeAnnotation;
  } else if (param.type === 'ObjectPattern') {
    // NOTE: something is wrong with recast and objectPatterns...
    // You cannot set typeAnnotation on them, do object spread instead

    var newProps = j.identifier('props');
    newProps.typeAnnotation = newTypeAnnotation;
    functionRoot.params = [newProps];
    var newSpread = j.variableDeclaration('const', [j.variableDeclarator(param, j.identifier('props'))]);

    // if the body of the function is an expression, we need to construct
    // a block statement to hold the props spread
    if (functionRoot.body.type === 'BlockStatement') {
      functionRoot.body.body.unshift(newSpread);
    } else {
      var returnExpression = j.returnStatement(functionRoot.body);
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
  var componentToPropTypesRemoved = removeComponentAssignmentPropTypes(ast, j);
  var components = Object.keys(componentToPropTypesRemoved);

  if (components.length === 0) {
    return null;
  }

  components.forEach(function (c) {
    var flowTypesRemoved = componentToPropTypesRemoved[c];
    var propIdentifier = components.length === 1 ? options.propsTypeSuffix : '' + c + options.propsTypeSuffix;
    var flowTypeProps = j.exportNamedDeclaration(j.typeAlias(j.identifier(propIdentifier), null, j.objectTypeAnnotation(flowTypesRemoved)));

    ast.find(j.FunctionDeclaration, {
      id: { name: c }
    }).forEach(function (f) {
      var insertNode = f.parent.node.type === 'Program' ? f : f.parent;
      insertNode.insertBefore(flowTypeProps);
      insertTypeIdentifierInFunction(f, j, propIdentifier);
    });

    ast.find(j.VariableDeclarator, {
      id: { name: c }
    }).forEach(function (f) {
      var insertNode = f.parent.parent.node.type === 'Program' ? f.parent : f.parent.parent;
      insertNode.insertBefore(flowTypeProps);
      insertTypeIdentifierInFunction(f, j, propIdentifier);
    });
  });

  return components.length > 0;
}