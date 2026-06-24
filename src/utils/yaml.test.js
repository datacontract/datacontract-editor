import { describe, it, expect } from 'vitest';
import { stringifyYaml, parseYaml } from './yaml.js';

describe('stringifyYaml round-trip preserves whitespace in strings', () => {
  const roundtrip = (value) => parseYaml(stringifyYaml(value));

  it('preserves a trailing space in a single-line string', () => {
    const input = { description: 'hello world ' };
    expect(roundtrip(input)).toEqual(input);
  });

  it('preserves a trailing space at the end of a multi-line string', () => {
    // Reproduces the bug: typing a space after a newline-containing description
    const input = { description: 'abc\ndef ' };
    expect(roundtrip(input)).toEqual(input);
  });

  it('preserves a trailing space on a non-last line of a multi-line string', () => {
    const input = { description: 'abc \ndef' };
    expect(roundtrip(input)).toEqual(input);
  });

  it('preserves trailing whitespace inside a custom property description', () => {
    const input = {
      customProperties: [{ property: 'k', value: 'v', description: 'abc\ndef ' }],
    };
    expect(roundtrip(input)).toEqual(input);
  });

  it('still renders clean multi-line strings as readable block literals', () => {
    const yaml = stringifyYaml({ description: 'line one\nline two' });
    expect(yaml).toContain('|-');
    expect(parseYaml(yaml)).toEqual({ description: 'line one\nline two' });
  });
});
