/**
 * Annotates ES2015 Class constructor and Class `props` member
 *
 * @param {jscodeshiftApi} j jscodeshift API
 * @param {Array} clazz Array of `Node`
 */
export default function annotateConstructor(j, clazz, name = 'Props') {
  const type = j.genericTypeAnnotation(j.identifier(name), null);
  const typeAnnotation = j.typeAnnotation(
    j.genericTypeAnnotation(j.identifier(name), null)
  );

  if (clazz.superClass && !clazz.superTypeParameters) {
    clazz.superTypeParameters = j.typeParameterInstantiation([type]);
  }

  const classBody = clazz.body && clazz.body.body;

  classBody.some(node => {
    if (node.kind === 'constructor') {
      // first parameter is always props regardless of name
      if (node.value.params && node.value.params.length) {
        node.value.params[0].typeAnnotation = typeAnnotation;
      }

      return true;
    }
  });
}
