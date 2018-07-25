'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createTypeAlias;
function createTypeAlias(j, flowTypes) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$name = _ref.name,
      name = _ref$name === undefined ? 'Props' : _ref$name,
      _ref$shouldExport = _ref.shouldExport,
      shouldExport = _ref$shouldExport === undefined ? false : _ref$shouldExport;

  var typeAlias = j.typeAlias(j.identifier(name), null, j.objectTypeAnnotation(flowTypes));

  if (shouldExport) {
    return j.exportNamedDeclaration(typeAlias);
  }

  return typeAlias;
}