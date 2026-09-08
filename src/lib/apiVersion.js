/**
 * Compare two ODCS apiVersion values (`v3.2.0`, `3.1.0`, …) numerically.
 * Returns <0, 0, >0 like a comparator; missing parts count as 0.
 */
export const compareApiVersions = (a, b) => {
  const parts = (value) =>
    String(value ?? '')
      .replace(/^v/, '')
      .split('.')
      .map((part) => parseInt(part, 10) || 0);
  const [a0 = 0, a1 = 0, a2 = 0] = parts(a);
  const [b0 = 0, b1 = 0, b2 = 0] = parts(b);
  return a0 - b0 || a1 - b1 || a2 - b2;
};
