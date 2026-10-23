/**
 * Flattens the host's team list ({ id, name, description, type, parentId, icon, selectable })
 * into tree order: parents first, children indented below them, siblings sorted by name.
 * Each entry gets a `level` for indentation. An entry whose parent is not in the list
 * becomes a root, so a missing ancestor never drops a selectable team from the list.
 */
export function buildTeamTree(teams) {
  if (!Array.isArray(teams)) return [];
  const entries = teams.filter((team) => team && team.id);
  const ids = new Set(entries.map((team) => team.id));
  const childrenByParent = new Map();
  const roots = [];
  for (const team of entries) {
    if (team.parentId && team.parentId !== team.id && ids.has(team.parentId)) {
      if (!childrenByParent.has(team.parentId)) childrenByParent.set(team.parentId, []);
      childrenByParent.get(team.parentId).push(team);
    } else {
      roots.push(team);
    }
  }

  const byName = (a, b) => (a.name || a.id).localeCompare(b.name || b.id);
  const result = [];
  const visited = new Set();
  const visit = (nodes, level) => {
    for (const node of [...nodes].sort(byName)) {
      // Guards against a parent cycle in the host's data.
      if (visited.has(node.id)) continue;
      visited.add(node.id);
      result.push({ ...node, level, selectable: node.selectable !== false });
      visit(childrenByParent.get(node.id) || [], level + 1);
    }
  };
  visit(roots, 0);
  return result;
}

/**
 * Teams matching the search term in name, id, description or type, in tree order. The ancestors
 * of a match stay listed so the hierarchy remains visible while searching.
 */
export function filterTeams(tree, search) {
  const term = (search || '').trim().toLowerCase();
  if (!term) return tree;
  const byId = new Map(tree.map((team) => [team.id, team]));
  const shown = new Set();
  for (const team of tree) {
    const matches = [team.name, team.id, team.description, team.type]
      .some((value) => typeof value === 'string' && value.toLowerCase().includes(term));
    if (!matches) continue;
    for (let current = team; current && !shown.has(current.id); current = byId.get(current.parentId)) {
      shown.add(current.id);
    }
  }
  return tree.filter((team) => shown.has(team.id));
}

/**
 * Whether the contract's team object holds anything besides its name. Such a contract opens
 * with the override fields shown, so values already in the contract are never hidden.
 * Custom properties listed in `alwaysShownCustomProperties` are configured by the organization
 * and shown regardless, so they do not count.
 */
export function hasTeamOverrides(team, alwaysShownCustomProperties = []) {
  if (!team) return false;
  if (Array.isArray(team)) return team.length > 0;
  const alwaysShown = new Set(alwaysShownCustomProperties);
  return Object.entries(team).some(([key, value]) => {
    if (key === 'name') return false;
    if (key === 'customProperties' && Array.isArray(value)) {
      return value.some((item) => !alwaysShown.has(item?.property));
    }
    if (key === 'customProperties' && value && typeof value === 'object') {
      return Object.keys(value).some((property) => !alwaysShown.has(property));
    }
    if (value === undefined || value === null || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  });
}
