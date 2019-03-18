'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = annotateConstructor;
/**
 * Annotates ES2015 Class constructor and Class `props` member
 *
 * @param {jscodeshiftApi} j jscodeshift API
 * @param {Array} body Array of `Node`
 */
function annotateConstructor(j, body) {
  var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Props';

  var type = j.genericTypeAnnotation(j.identifier(name), null);

  if (body.superClass && !body.superTypeParameters) {
    body.superTypeParameters = j.typeParameterInstantiation([type]);
  }
}