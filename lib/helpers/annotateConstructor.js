'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = annotateConstructor;
/**
 * Annotates ES2015 Class constructor and Class `props` member
 *
 * @param {jscodeshiftApi} j jscodeshift API
 * @param {Array} clazz Array of `Node`
 */
function annotateConstructor(j, clazz) {
  var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Props';

  var type = j.genericTypeAnnotation(j.identifier(name), null);
  var typeAnnotation = j.typeAnnotation(j.genericTypeAnnotation(j.identifier(name), null));

  if (clazz.superClass && !clazz.superTypeParameters) {
    clazz.superTypeParameters = j.typeParameterInstantiation([type]);
  }

  var classBody = clazz.body && clazz.body.body;

  classBody.some(function (node) {
    if (node.kind === 'constructor') {
      // first parameter is always props regardless of name
      if (node.value.params && node.value.params.length) {
        node.value.params[0].typeAnnotation = typeAnnotation;
      }

      return true;
    }
  });
}