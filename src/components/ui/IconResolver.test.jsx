import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { IconResolver } from './IconResolver.jsx';

describe('IconResolver', () => {
  it('renders the GitHub icon for GitHub URLs', () => {
    const markup = renderToStaticMarkup(<IconResolver url="https://github.com/example/repository" />);

    expect(markup).toContain('<svg');
  });
});
