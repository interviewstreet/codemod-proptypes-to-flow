"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = annotateConstructor;

var _constants = require("./constants");

/**
 * Annotates ES2015 Class constructor and Class `props` member
 *
 * @param {jscodeshiftApi} j jscodeshift API
 * @param {Array} clazz Array of `Node`
 */
function annotateConstructor(j, clazz, name = 'Props') {
  const type = j.genericTypeAnnotation(j.identifier(name), null);
  const typeAnnotation = j.typeAnnotation(j.genericTypeAnnotation(j.identifier(name), null));

  if (clazz.superClass && !clazz.superTypeParameters) {
    clazz.superTypeParameters = j.typeParameterInstantiation([type]);
  }

  const classBody = clazz.body && clazz.body.body;
  classBody.some(node => {
    if (node.kind === _constants.NODE_TYPES.CONSTRUCTOR) {
      // first parameter is always props regardless of name
      if (node.params && node.params.length) {
        node.params[0].typeAnnotation = typeAnnotation;
      }

      return true;
    }
  });
}