/**
 * Whether `path` (such as `schema[0].properties[2]`) points at the same element of the contract in
 * `before` and `after`. Elements may be renamed or edited, but not added, removed or reordered.
 */
export const staysInPlace = (before, after, path) => {
  let a = before;
  let b = after;
  return path.match(/[^.[\]]+/g).every((key) => {
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length || Number(key) >= a.length) return false;

      // Without distinct names, a reordering only shows in the content.
      const haveDistinctNames = [a, b].every((list) =>
        list.every((element) => element?.name) && new Set(list.map((element) => element.name)).size === list.length);
      const changed = a.filter((element, i) =>
        haveDistinctNames ? element.name !== b[i].name : JSON.stringify(element) !== JSON.stringify(b[i]));
      if (changed.length > 1) return false;
    }
    a = a?.[key];
    b = b?.[key];
    return a != null && b != null;
  });
};
