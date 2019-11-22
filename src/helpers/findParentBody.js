import { IDENTIFIERS } from './constants';

export default function findParentBody(p, memo) {
  if (p.parentPath) {
    if (p.parentPath.name === IDENTIFIERS.BODY) {
      return {
        child: p.value,
        body: p.parentPath,
      };
    }
    return findParentBody(p.parentPath);
  }
}
