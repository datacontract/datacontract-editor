import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

// The store creates the local file storage backend on import, which feature-detects on window.
vi.hoisted(() => {
  globalThis.window ??= {};
});

// Monaco only runs in a browser; the stub exposes the prop under test as a data attribute.
vi.mock('./ObjectYamlEditor.jsx', () => ({
  default: ({ readOnly }) => <pre data-yaml-editor data-read-only={readOnly ? 'true' : 'false'} />,
}));

import CustomPropertyField from './CustomPropertyField.jsx';

const render = (config, value) =>
  renderToStaticMarkup(<CustomPropertyField config={config} value={value} onChange={() => {}} />);

const field = (type, extra = {}) => ({ property: 'owner', title: 'Owner', type, readOnly: true, ...extra });

/**
 * `readOnly: true` keeps a custom property visible but not editable in the form view. Monaco YAML
 * editing is not driven by this component and stays editable, like `hidden`.
 */
describe('CustomPropertyField readOnly', () => {
  it('leaves an editable text property without readonly or disabled', () => {
    const html = render({ property: 'owner', title: 'Owner', type: 'text' }, 'analytics');
    // Attributes only: the Tailwind `disabled:` variants in class names do not count.
    expect(html).not.toMatch(/ (readonly|disabled)=""/);
  });

  it('renders a read-only text property as a readonly input', () => {
    expect(render(field('text'), 'analytics')).toMatch(/<input(?=[^>]*name="owner")[^>]*readonly=""/i);
  });

  it.each(['url', 'email'])('renders a read-only %s property as a readonly input', (type) => {
    expect(render(field(type), 'x')).toMatch(/<input(?=[^>]*name="owner")[^>]*readonly=""/i);
  });

  it('renders a read-only textarea as readonly', () => {
    expect(render(field('textarea'), 'analytics')).toMatch(/<textarea(?=[^>]*name="owner")[^>]*readonly=""/i);
  });

  it.each(['number', 'integer', 'date', 'datetime'])('renders a read-only %s property as a readonly input', (type) => {
    expect(render(field(type), type === 'date' ? '2024-01-01' : 1)).toMatch(/<input(?=[^>]*name="owner")[^>]*readonly=""/i);
  });

  it('disables a read-only select', () => {
    const html = render(field('select', { enum: ['analytics', 'sales'] }), 'analytics');
    expect(html).toMatch(/<input[^>]*disabled=""/);
  });

  it('disables the option buttons of a read-only multiselect', () => {
    const html = render(field('multiselect', { enum: ['analytics', 'sales'] }), ['analytics']);
    const buttons = html.match(/<button[^>]*>/g);
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(button).toMatch(/disabled=""/));
  });

  it('disables a read-only boolean select', () => {
    expect(render(field('boolean'), true)).toMatch(/<select[^>]*disabled=""/);
  });

  it('disables adding and removing tags on a read-only array', () => {
    const html = render(field('array'), ['a', 'b']);
    expect(html).not.toMatch(/aria-label="[^"]*"[^>]*>/); // no remove buttons
    expect(html).toMatch(/<input[^>]*disabled=""/);
  });

  it('passes readOnly to the YAML editor of a read-only yaml property', () => {
    expect(render(field('yaml'), { env: 'prod' })).toContain('data-read-only="true"');
  });

  it('keeps the YAML editor editable when not read-only', () => {
    expect(render({ property: 'owner', title: 'Owner', type: 'yaml' }, { env: 'prod' })).toContain('data-read-only="false"');
  });
});
