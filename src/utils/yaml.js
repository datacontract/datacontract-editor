import * as YAML from 'yaml';

/**
 * Default options for YAML stringification.
 * - QUOTE_DOUBLE for values (e.g., name: "value")
 * - PLAIN for keys (e.g., name: not "name":)
 */
const defaultOptions = {
  lineWidth: 0,
  defaultStringType: 'QUOTE_DOUBLE',
  defaultKeyType: 'PLAIN',
  doubleQuotedAsJSON: true,
};

let yamlFormatConfig = { removeTrailingWhitespace: true, addFinalNewline: true };

export function setYamlFormatConfig(config) {
  yamlFormatConfig = { ...yamlFormatConfig, ...config };
}

export function applyYamlFormat(str) {
  if (!str) return str;
  if (yamlFormatConfig.removeTrailingWhitespace !== false) {
    str = str.replace(/[ \t]+$/gm, '');
  }
  if (yamlFormatConfig.addFinalNewline !== false) {
    if (!str.endsWith('\n')) str += '\n';
  } else {
    str = str.replace(/\n+$/, '');
  }
  return str;
}

/**
 * Stringify a JavaScript object to YAML with consistent formatting.
 * @param {any} value - The value to stringify
 * @param {object} options - Optional YAML stringify options (merged with defaults)
 * @returns {string} The YAML string
 */
export function stringifyYaml(value, options = {}) {
  const doc = new YAML.Document(value);
  YAML.visit(doc, {
    Scalar(key, node) {
      node.type = styleFor(node.value);
    },
  });
  const raw = doc.toString( { ...defaultOptions, ...options });
  return applyYamlFormat(raw);
}

// Render multi-line strings as readable block literals (|-), but only when
// safe to do so. Block scalars cannot carry significant trailing whitespace
// through applyYamlFormat (which strips trailing whitespace per line), so
// strings with trailing whitespace on any line keep the default
// (double-quoted) style, where the whitespace survives inside the quotes.
function styleFor(value) {
  if (
    typeof value === "string" &&
    value.includes("\n") &&
    !value.split("\n").some((line) => /[ \t]$/.test(line))
  ) {
    return "BLOCK_LITERAL";
  }
  return undefined;
}

/**
 * Write `value` as YAML over `previousYaml`, so that what did not change keeps its text:
 * comments, quoting and the order of keys. Forms change one value of the parsed contract;
 * stringifying the whole object would drop every comment a user wrote in the YAML.
 * Falls back to {@link stringifyYaml} when there is no previous document to build on.
 * @param {string} previousYaml - The YAML the value was parsed from
 * @param {any} value - The new value of the whole document
 * @param {object} options - Optional YAML stringify options (merged with defaults)
 * @returns {string} The YAML string
 */
export function updateYaml(previousYaml, value, options = {}) {
  if (!previousYaml || !previousYaml.trim()) return stringifyYaml(value, options);
  const doc = YAML.parseDocument(previousYaml);
  if (doc.errors.length > 0) return stringifyYaml(value, options);
  if (sameData(doc, doc.contents, value)) return previousYaml;
  keepTrailingCommentInPlace(doc, previousYaml);
  doc.contents = merged(doc, doc.contents, value);
  const raw = doc.toString({ ...defaultOptions, ...options });
  return applyYamlFormat(raw);
}

// The yaml library prints a comment at the end of a document after a blank line. Where the source
// has none, the comment moves to the contents, which print it right after their last item.
function keepTrailingCommentInPlace(doc, yaml) {
  if (!doc.comment || !YAML.isCollection(doc.contents) || doc.contents.comment) return;
  const lines = yaml.replace(/\s+$/, "").split("\n");
  let index = lines.length - 1;
  while (index >= 0 && /^\s*#/.test(lines[index])) index--;
  if (index < 0 || lines[index].trim() === "") return;
  doc.contents.comment = doc.comment;
  doc.comment = null;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sameData(doc, node, value) {
  if (node === null || node === undefined) return value === undefined;
  return JSON.stringify(node.toJS(doc)) === JSON.stringify(value);
}

// The node for `value`, reusing `node` and its comments where it stands for the same thing.
function merged(doc, node, value) {
  if (sameData(doc, node, value)) return node;
  if (isPlainObject(value) && YAML.isMap(node)) return mergedMap(doc, node, value);
  if (Array.isArray(value) && YAML.isSeq(node)) return mergedSeq(doc, node, value);
  if (YAML.isScalar(node) && !isPlainObject(value) && !Array.isArray(value) && typeof node.value === typeof value) {
    node.value = value;
    node.type = styleFor(value);
    return node;
  }
  return withCommentsOf(node, created(doc, value));
}

function mergedMap(doc, map, value) {
  for (const pair of [...map.items]) {
    const key = YAML.isScalar(pair.key) ? pair.key.value : pair.key;
    if (!Object.prototype.hasOwnProperty.call(value, key) || value[key] === undefined) map.delete(pair.key);
  }
  for (const [key, child] of Object.entries(value)) {
    if (child === undefined) continue;
    const pair = map.items.find((item) => (YAML.isScalar(item.key) ? item.key.value : item.key) === key);
    if (pair) {
      pair.value = merged(doc, pair.value, child);
    } else {
      map.add(doc.createPair(key, created(doc, child)));
    }
  }
  return map;
}

// Items keep their node, and so their comments, when they move: matched by `id` or `name`. An item
// that matches none, such as a renamed one, takes the item at its position, unless another item
// still names that one.
function mergedSeq(doc, seq, value) {
  const identity = (data) => (isPlainObject(data) ? data.id ?? data.name : undefined);
  const unused = [...seq.items];
  const byIdentity = new Map();
  unused.forEach((item) => {
    const key = YAML.isMap(item) ? identity(item.toJS(doc)) : undefined;
    if (key !== undefined && !byIdentity.has(key)) byIdentity.set(key, item);
  });
  const take = (item) => unused.splice(unused.indexOf(item), 1);
  const matches = value.map((child) => {
    const key = identity(child);
    const item = key !== undefined ? byIdentity.get(key) : undefined;
    if (item && unused.includes(item)) {
      take(item);
      return item;
    }
    return undefined;
  });
  const named = new Set(value.map(identity).filter((key) => key !== undefined));
  seq.items = value.map((child, index) => {
    let item = matches[index];
    if (!item) {
      const atPosition = seq.items[index];
      const itsKey = YAML.isMap(atPosition) ? identity(atPosition.toJS(doc)) : undefined;
      if (atPosition && unused.includes(atPosition) && (itsKey === undefined || !named.has(itsKey))) {
        take(atPosition);
        item = atPosition;
      }
    }
    return item ? merged(doc, item, child) : created(doc, child);
  });
  return seq;
}

function created(doc, value) {
  const node = doc.createNode(value);
  YAML.visit(node, {
    Scalar(key, scalar) {
      scalar.type = styleFor(scalar.value);
    },
  });
  return node;
}

function withCommentsOf(oldNode, newNode) {
  if (oldNode && newNode && YAML.isNode(oldNode) && YAML.isNode(newNode)) {
    newNode.commentBefore = oldNode.commentBefore;
    newNode.comment = oldNode.comment;
    newNode.spaceBefore = oldNode.spaceBefore;
  }
  return newNode;
}

/**
 * Parse a YAML string to a JavaScript object.
 * @param {string} yaml - The YAML string to parse
 * @returns {any} The parsed value
 */
export function parseYaml(yaml) {
  return YAML.parse(yaml);
}

// Re-export the original YAML module for cases where direct access is needed
export { YAML };
