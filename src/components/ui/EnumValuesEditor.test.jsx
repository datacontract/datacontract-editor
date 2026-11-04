import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

// StableIdRow reaches the store, which feature-detects its storage backend on window at import.
vi.hoisted(() => {
  globalThis.window ??= {};
});

import EnumValuesEditor from './EnumValuesEditor.jsx';

const inherited = [
  { value: 'active', label: 'Active' },
  { value: 'closed' },
];

const render = (value, inheritedValue) =>
  renderToStaticMarkup(<EnumValuesEditor value={value} onChange={() => {}} inherited={inheritedValue} />);

/**
 * A property without allowed values of its own shows the ones its linked definition declares, the way
 * the other inherited fields show theirs as a placeholder, with the button that copies them in.
 */
describe('EnumValuesEditor inherited values', () => {
  it('lists the inherited values with their labels when the property has none', () => {
    const html = render(undefined, inherited);
    expect(html).toContain('active');
    expect(html).toContain('Active');
    expect(html).toContain('closed');
    expect(html).toContain('input.overrideInherited');
  });

  it('keeps the add button so own values can still be written', () => {
    expect(render(undefined, inherited)).toContain('enumValues.add');
  });

  it('hides the inherited values once the property has its own', () => {
    const html = render([{ value: 'draft' }], inherited);
    expect(html).not.toContain('active');
    expect(html).not.toContain('input.overrideInherited');
  });

  it('renders nothing extra without inherited values', () => {
    expect(render(undefined, undefined)).not.toContain('input.overrideInherited');
  });
});
