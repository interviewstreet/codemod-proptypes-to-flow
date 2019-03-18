'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transformEs6Classes;

var _annotateConstructor = require('../helpers/annotateConstructor');

var _annotateConstructor2 = _interopRequireDefault(_annotateConstructor);

var _createTypeAlias = require('../helpers/createTypeAlias');

var _createTypeAlias2 = _interopRequireDefault(_createTypeAlias);

var _findIndex = require('../helpers/findIndex');

var _findIndex2 = _interopRequireDefault(_findIndex);

var _findParentBody2 = require('../helpers/findParentBody');

var _findParentBody3 = _interopRequireDefault(_findParentBody2);

var _transformProperties = require('../helpers/transformProperties');

var _transformProperties2 = _interopRequireDefault(_transformProperties);

var _ReactUtils = require('../helpers/ReactUtils');

var _ReactUtils2 = _interopRequireDefault(_ReactUtils);

var _removePropTypeImport = require('../helpers/removePropTypeImport');

var _removePropTypeImport2 = _interopRequireDefault(_removePropTypeImport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isStaticPropType = function isStaticPropType(p) {
  return p.type === 'ClassProperty' && p.static && p.key.type === 'Identifier' && p.key.name === 'propTypes';
};

/**
 * Transforms es2016 components
 * @return true if any components were transformed.
 */
function transformEs6Classes(ast, j, options) {
  var reactUtils = (0, _ReactUtils2.default)(j);

  var classNamesWithPropsOutside = [];

  // NOTE: reactUtils.findReactES6ClassDeclaration(ast) is missing extends
  // for local imported components... If finding all classes is too greety,
  // we might combine findReactES6ClassDeclaration with classes that have a
  // render method.
  var reactClassPaths = ast.find(j.ClassDeclaration);

  // find classes with propType static class property
  var modifications = reactClassPaths.forEach(function (p) {
    var className = reactUtils.getComponentName(p);
    var propIdentifier = reactClassPaths.length === 1 ? options.propsTypeSuffix : '' + className + options.propsTypeSuffix;
    var properties = void 0;

    var classBody = p.value.body && p.value.body.body;
    if (classBody) {
      // console.log(containsFlowProps(classBody));
      // if (containsFlowProps(classBody)) {
      // return;
      // }

      (0, _annotateConstructor2.default)(j, p.value, propIdentifier);
      var index = (0, _findIndex2.default)(classBody, isStaticPropType);
      if (typeof index !== 'undefined') {
        var classProperty = classBody.splice(index, 1).pop();
        properties = classProperty.value.properties;
      } else {
        // look for propTypes defined elsewhere
        classNamesWithPropsOutside.push(className);

        ast.find(j.AssignmentExpression, {
          left: {
            type: 'MemberExpression',
            object: {
              name: className
            },
            property: {
              name: 'propTypes'
            }
          },
          right: {
            type: 'ObjectExpression'
          }
        }).forEach(function (p) {
          // this should only be one?
          properties = p.value.right.properties;
        }).remove();
      }

      properties = properties || [];
      var typeAlias = (0, _createTypeAlias2.default)(j, (0, _transformProperties2.default)(j, properties), {
        name: propIdentifier,
        shouldExport: false
      });

      // Find location to put propTypes flowtype definition
      // This will place ahead of class def

      var _findParentBody = (0, _findParentBody3.default)(p),
          child = _findParentBody.child,
          body = _findParentBody.body;

      if (body && child) {
        var bodyIndex = (0, _findIndex2.default)(body.value, function (b) {
          return b === child;
        });
        if (bodyIndex) {
          body.value.splice(bodyIndex, 0, typeAlias);
        }
      }
    }
  }).size();

  ast.find(j.ExpressionStatement, {
    expression: {
      type: 'AssignmentExpression',
      left: {
        type: 'MemberExpression',
        property: {
          name: 'propTypes'
        }
      },
      right: {
        type: 'ObjectExpression'
      }
    }
  }).filter(function (p) {
    return classNamesWithPropsOutside.indexOf(p.value.expression.left.object.name) > -1;
  }).remove();

  (0, _removePropTypeImport2.default)(j, ast);

  return modifications > 0;
}