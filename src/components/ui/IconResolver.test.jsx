import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IconResolver } from './IconResolver.jsx';
import iconResolverSource from './IconResolver.jsx?raw';

// Every icon file, so a newly added icon is checked without touching this test.
const iconModules = import.meta.glob('../../assets/link-icons/*.jsx', { eager: true });

// One input per `case` in the IconResolver switch. The test below fails when a case is added
// without an entry here, so every icon the resolver can return is rendered at least once.
const inputsByIconType = {
  github: { url: 'https://github.com/example/repository' },
  gitlab: { url: 'https://gitlab.com/example/repository' },
  repository: { type: 'repository' },
  notion: { url: 'https://www.notion.so/example' },
  jira: { url: 'https://example.atlassian.net/browse/X-1' },
  linear: { url: 'https://linear.app/example' },
  confluence: { url: 'https://confluence.example.com/page' },
  slack: { url: 'https://example.slack.com/archives/C1' },
  trello: { url: 'https://trello.com/b/example' },
  asana: { url: 'https://app.asana.com/0/1' },
  monday: { url: 'https://example.monday.com/boards/1' },
  clickup: { url: 'https://app.clickup.com/1' },
  airtable: { url: 'https://airtable.com/example' },
  snowflake: { type: 'snowflake' },
  databricks: { type: 'databricks' },
  bigquery: { type: 'bigquery' },
  starburst: { type: 'starburst' },
  trino: { type: 'trino' },
  confluent: { type: 'confluent' },
  'confluent-schema-registry': { type: 'schemaregistry' },
  kafka: { type: 'kafka' },
  mssql: { type: 'mssql' },
  postgres: { type: 'postgres' },
  s3: { type: 's3' },
  openmetadata: { type: 'openmetadata' },
  collibra: { type: 'collibra' },
  purview: { type: 'purview' },
  onetrust: { type: 'onetrust' },
  leanix: { type: 'leanix' },
  powerbi: { type: 'powerbi' },
  teams: { type: 'teams' },
  api: { type: 'api' },
  sap: { type: 'sap' },
  datawarehouse: { type: 'datawarehouse' },
  catalog: { type: 'catalog' },
  documentation: { type: 'documentation' },
  sample: { type: 'sample' },
  changelog: { type: 'changelog' },
  'file-code': { type: 'dataproductspecification' },
  deleted: { type: 'deleted' },
  semantic: { type: 'semantics' },
};

const switchCases = [...iconResolverSource.matchAll(/case '([^']+)':/g)].map((match) => match[1]);
const defaultMarkup = renderToStaticMarkup(<IconResolver url="https://unknown.example.com" />);

describe('link icons', () => {
  // React reports invalid SVG markup such as `stop-color` instead of `stopColor` via console.error,
  // and only once per attribute name per process, so render and check in the same test.
  let consoleError;
  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleError.mockRestore();
  });

  it.each(Object.keys(iconModules))('%s exports a component that renders an svg without React warnings', (path) => {
    const Icon = iconModules[path].default;

    expect(typeof Icon).toBe('function');
    expect(renderToStaticMarkup(<Icon className="h-4 w-4" />)).toContain('<svg');
    expect(consoleError.mock.calls.map((args) => args.join(' '))).toEqual([]);
  });
});

describe('IconResolver', () => {
  it('has a test input for every icon type it handles', () => {
    expect(Object.keys(inputsByIconType).sort()).toEqual([...switchCases].sort());
  });

  it.each(Object.entries(inputsByIconType))('renders the %s icon', (_iconType, props) => {
    const markup = renderToStaticMarkup(<IconResolver {...props} />);

    expect(markup).toContain('<svg');
    expect(markup).not.toBe(defaultMarkup);
  });

  it('renders the default icon for unknown URLs', () => {
    expect(defaultMarkup).toContain('<svg');
  });
});
