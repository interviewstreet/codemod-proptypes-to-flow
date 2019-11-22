"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transformEs6Classes;

var _annotateConstructor = _interopRequireDefault(require("../helpers/annotateConstructor"));

var _createTypeAlias = _interopRequireDefault(require("../helpers/createTypeAlias"));

var _findParentBody = _interopRequireDefault(require("../helpers/findParentBody"));

var _transformProperties = _interopRequireDefault(require("../helpers/transformProperties"));

var _ReactUtils = _interopRequireDefault(require("../helpers/ReactUtils"));

var _removePropTypeImport = _interopRequireDefault(require("../helpers/removePropTypeImport"));

var _constants = require("../helpers/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isStaticPropType = p => {
  return p.type === _constants.NODE_TYPES.CLASS_PROPERTY && p.static && p.key.type === _constants.NODE_TYPES.IDENTIFIER && p.key.name === _constants.IDENTIFIERS.PROPTYPES;
};
/**
 * Transforms es2016 components
 * @return true if any components were transformed.
 */


function transformEs6Classes(ast, j, options) {
  const reactUtils = (0, _ReactUtils.default)(j);
  const classNamesWithPropsOutside = []; // NOTE: reactUtils.findReactES6ClassDeclaration(ast) is missing extends
  // for local imported components... If finding all classes is too greety,
  // we might combine findReactES6ClassDeclaration with classes that have a
  // render method.

  const reactClassPaths = ast.find(j.ClassDeclaration); // find classes with propType static class property

  const modifications = reactClassPaths.forEach(p => {
    const className = reactUtils.getComponentName(p);
    const propIdentifier = reactClassPaths.length === 1 ? options.propsTypeSuffix : `${className}${options.propsTypeSuffix}`;
    let properties;
    const classBody = p.value.body && p.value.body.body;

    if (classBody) {
      // console.log(containsFlowProps(classBody));
      // if (containsFlowProps(classBody)) {
      // return;
      // }
      (0, _annotateConstructor.default)(j, p.value, propIdentifier);
      const index = classBody.findIndex(isStaticPropType);

      if (index !== -1) {
        const classProperty = classBody.splice(index, 1).pop();
        properties = classProperty.value.properties;
      } else {
        // look for propTypes defined elsewhere
        classNamesWithPropsOutside.push(className);
        ast.find(j.AssignmentExpression, {
          left: {
            type: _constants.EXPRESSION_TYPES.MEMBER_EXPRESSION,
            object: {
              name: className
            },
            property: {
              name: _constants.IDENTIFIERS.PROPTYPES
            }
          },
          right: {
            type: _constants.EXPRESSION_TYPES.MEMBER_EXPRESSION
          }
        }).forEach(p => {
          // this should only be one?
          properties = p.value.right.properties;
        }).remove();
      }

      properties = properties || [];
      const typeAlias = (0, _createTypeAlias.default)(j, (0, _transformProperties.default)(j, properties), {
        name: propIdentifier,
        shouldExport: false
      }); // Find location to put propTypes flowtype definition
      // This will place ahead of class def

      const {
        child,
        body
      } = (0, _findParentBody.default)(p);

      if (body && child) {
        const bodyValue = body.value || [];
        const bodyIndex = bodyValue.findIndex(b => b === child);

        if (bodyIndex !== -1) {
          body.value.splice(bodyIndex, 0, typeAlias);
        }
      }
    }
  }).size();
  ast.find(j.ExpressionStatement, {
    expression: {
      type: _constants.EXPRESSION_TYPES.ASSIGNMENT_EXPRESSION,
      left: {
        type: _constants.EXPRESSION_TYPES.MEMBER_EXPRESSION,
        property: {
          name: _constants.IDENTIFIERS.PROPTYPES
        }
      },
      right: {
        type: _constants.EXPRESSION_TYPES.OBJECT_EXPRESSION
      }
    }
  }).filter(p => classNamesWithPropsOutside.indexOf(p.value.expression.left.object.name) > -1).remove();
  (0, _removePropTypeImport.default)(j, ast);
  return modifications > 0;
}