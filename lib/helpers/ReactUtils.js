'use strict';

// Origin: https://github.com/reactjs/react-codemod/blob/master/transforms/utils/ReactUtils.js
/* eslint-disable func-names */
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

module.exports = function (j) {
  var REACT_CREATE_CLASS_MEMBER_EXPRESSION = {
    type: 'MemberExpression',
    object: {
      name: 'React'
    },
    property: {
      name: 'createClass'
    }
  };

  // ---------------------------------------------------------------------------
  // Checks if the file requires a certain module
  var hasModule = function hasModule(path, module) {
    return path.findVariableDeclarators().filter(j.filters.VariableDeclarator.requiresModule(module)).size() === 1 || path.find(j.ImportDeclaration, {
      type: 'ImportDeclaration',
      source: {
        type: 'Literal'
      }
    }).filter(function (declarator) {
      return declarator.value.source.value === module;
    }).size() === 1;
  };

  var hasReact = function hasReact(path) {
    return hasModule(path, 'React') || hasModule(path, 'react') || hasModule(path, 'react/addons') || hasModule(path, 'react-native');
  };

  // ---------------------------------------------------------------------------
  // Finds all variable declarations that call React.createClass
  var findReactCreateClassCallExpression = function findReactCreateClassCallExpression(path) {
    return j(path).find(j.CallExpression, {
      callee: REACT_CREATE_CLASS_MEMBER_EXPRESSION
    });
  };

  var findReactCreateClass = function findReactCreateClass(path) {
    return path.findVariableDeclarators().filter(function (decl) {
      return findReactCreateClassCallExpression(decl).size() > 0;
    });
  };

  var findReactCreateClassExportDefault = function findReactCreateClassExportDefault(path) {
    return path.find(j.ExportDeclaration, {
      default: true,
      declaration: {
        type: 'CallExpression',
        callee: REACT_CREATE_CLASS_MEMBER_EXPRESSION
      }
    });
  };

  var findReactCreateClassModuleExports = function findReactCreateClassModuleExports(path) {
    return path.find(j.AssignmentExpression, {
      left: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'module'
        },
        property: {
          type: 'Identifier',
          name: 'exports'
        }
      },
      right: {
        type: 'CallExpression',
        callee: REACT_CREATE_CLASS_MEMBER_EXPRESSION
      }
    });
  };

  var getReactCreateClassSpec = function getReactCreateClassSpec(classPath) {
    var value = classPath.value;

    var args = (value.init || value.right || value.declaration).arguments;
    if (args && args.length) {
      var spec = args[0];
      if (spec.type === 'ObjectExpression' && Array.isArray(spec.properties)) {
        return spec;
      }
    }
    return null;
  };

  // ---------------------------------------------------------------------------
  // Finds alias for React.Component if used as named import.
  var findReactComponentName = function findReactComponentName(path) {
    var reactImportDeclaration = path.find(j.ImportDeclaration, {
      type: 'ImportDeclaration',
      source: {
        type: 'Literal'
      }
    }).filter(function (importDeclaration) {
      return hasReact(path);
    });

    var componentImportSpecifier = reactImportDeclaration.find(j.ImportSpecifier, {
      type: 'ImportSpecifier',
      imported: {
        type: 'Identifier',
        name: 'Component'
      }
    }).at(0);

    var paths = componentImportSpecifier.paths();
    return paths.length ? paths[0].value.local.name : undefined;
  };

  // Finds all classes that extend React.Component
  var findReactES6ClassDeclaration = function findReactES6ClassDeclaration(path) {
    var componentImport = findReactComponentName(path);
    var selector = componentImport ? {
      superClass: {
        type: 'Identifier',
        name: componentImport
      }
    } : {
      superClass: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'React'
        },
        property: {
          type: 'Identifier',
          name: 'Component'
        }
      }
    };

    return path.find(j.ClassDeclaration, selector);
  };

  // ---------------------------------------------------------------------------
  // Checks if the React class has mixins
  var isMixinProperty = function isMixinProperty(property) {
    var key = property.key;
    var value = property.value;
    return key.name === 'mixins' && value.type === 'ArrayExpression' && Array.isArray(value.elements) && value.elements.length;
  };

  var hasMixins = function hasMixins(classPath) {
    var spec = getReactCreateClassSpec(classPath);
    return spec && spec.properties.some(isMixinProperty);
  };

  // ---------------------------------------------------------------------------
  // Others
  var getClassExtendReactSpec = function getClassExtendReactSpec(classPath) {
    return classPath.value.body;
  };

  var createCreateReactClassCallExpression = function createCreateReactClassCallExpression(properties) {
    return j.callExpression(j.memberExpression(j.identifier('React'), j.identifier('createClass'), false), [j.objectExpression(properties)]);
  };

  var getComponentName = function getComponentName(classPath) {
    return classPath.node.id && classPath.node.id.name;
  };

  // ---------------------------------------------------------------------------
  // Direct methods! (see explanation below)
  var findAllReactCreateClassCalls = function findAllReactCreateClassCalls(path) {
    return path.find(j.CallExpression, {
      callee: REACT_CREATE_CLASS_MEMBER_EXPRESSION
    });
  };

  // Mixin Stuff
  var containSameElements = function containSameElements(ls1, ls2) {
    if (ls1.length !== ls2.length) {
      return false;
    }

    return ls1.reduce(function (res, x) {
      return res && ls2.indexOf(x) !== -1;
    }, true) && ls2.reduce(function (res, x) {
      return res && ls1.indexOf(x) !== -1;
    }, true);
  };

  var keyNameIsMixins = function keyNameIsMixins(property) {
    return property.key.name === 'mixins';
  };

  var isSpecificMixinsProperty = function isSpecificMixinsProperty(property, mixinIdentifierNames) {
    var key = property.key;
    var value = property.value;

    return key.name === 'mixins' && value.type === 'ArrayExpression' && Array.isArray(value.elements) && value.elements.every(function (elem) {
      return elem.type === 'Identifier';
    }) && containSameElements(value.elements.map(function (elem) {
      return elem.name;
    }), mixinIdentifierNames);
  };

  // These following methods assume that the argument is
  // a `React.createClass` call expression. In other words,
  // they should only be used with `findAllReactCreateClassCalls`.
  var directlyGetCreateClassSpec = function directlyGetCreateClassSpec(classPath) {
    if (!classPath || !classPath.value) {
      return null;
    }
    var args = classPath.value.arguments;
    if (args && args.length) {
      var spec = args[0];
      if (spec.type === 'ObjectExpression' && Array.isArray(spec.properties)) {
        return spec;
      }
    }
    return null;
  };

  var directlyGetComponentName = function directlyGetComponentName(classPath) {
    var result = '';
    if (classPath.parentPath.value && classPath.parentPath.value.type === 'VariableDeclarator') {
      result = classPath.parentPath.value.id.name;
    }
    return result;
  };

  var directlyHasMixinsField = function directlyHasMixinsField(classPath) {
    var spec = directlyGetCreateClassSpec(classPath);
    return spec && spec.properties.some(keyNameIsMixins);
  };

  var directlyHasSpecificMixins = function directlyHasSpecificMixins(classPath, mixinIdentifierNames) {
    var spec = directlyGetCreateClassSpec(classPath);
    return spec && spec.properties.some(function (prop) {
      return isSpecificMixinsProperty(prop, mixinIdentifierNames);
    });
  };

  return {
    createCreateReactClassCallExpression: createCreateReactClassCallExpression,
    findReactES6ClassDeclaration: findReactES6ClassDeclaration,
    findReactCreateClass: findReactCreateClass,
    findReactCreateClassCallExpression: findReactCreateClassCallExpression,
    findReactCreateClassModuleExports: findReactCreateClassModuleExports,
    findReactCreateClassExportDefault: findReactCreateClassExportDefault,
    getComponentName: getComponentName,
    getReactCreateClassSpec: getReactCreateClassSpec,
    getClassExtendReactSpec: getClassExtendReactSpec,
    hasMixins: hasMixins,
    hasModule: hasModule,
    hasReact: hasReact,
    isMixinProperty: isMixinProperty,

    // "direct" methods
    findAllReactCreateClassCalls: findAllReactCreateClassCalls,
    directlyGetComponentName: directlyGetComponentName,
    directlyGetCreateClassSpec: directlyGetCreateClassSpec,
    directlyHasMixinsField: directlyHasMixinsField,
    directlyHasSpecificMixins: directlyHasSpecificMixins
  };
};