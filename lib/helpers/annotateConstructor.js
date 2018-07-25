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

  var constructorIndex = void 0;
  var typeAnnotation = j.typeAnnotation(j.genericTypeAnnotation(j.identifier(name), null));

  body.some(function (b, i) {
    if (b.kind === 'constructor') {
      constructorIndex = i + 1;

      // first parameter is always props regardless of name
      if (b.value.params && b.value.params.length) {
        b.value.params[0].typeAnnotation = typeAnnotation;
      }
      return true;
    }
  });

  body.splice(constructorIndex, 0, j.classProperty(j.identifier('props'), null, typeAnnotation));
}