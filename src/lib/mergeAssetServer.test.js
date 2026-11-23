import { describe, expect, it } from 'vitest';
import { serverForApiVersion } from './forApiVersion.js';
import { mergeAssetServer } from './mergeAssetServer.js';

const suggested = {
  server: 'default',
  type: 'snowflake',
  account: 'acme',
  database: 'SHOP',
  schema: 'SALES',
  host: null,
  customProperties: [{ property: 'assetId', value: 'shop-sales' }, { property: 'type', value: 'snowflake_schema' }],
};

describe('mergeAssetServer', () => {
  it('replaces the type-specific fields and keeps the server-level ones', () => {
    const current = {
      server: 'production',
      environment: 'prod',
      description: 'Main warehouse',
      type: 'postgres',
      host: 'db.example.com',
      customProperties: [{ property: 'owner', value: 'sales' }],
    };

    expect(mergeAssetServer(current, suggested)).toEqual({
      server: 'production',
      environment: 'prod',
      description: 'Main warehouse',
      type: 'snowflake',
      account: 'acme',
      database: 'SHOP',
      schema: 'SALES',
      customProperties: [{ property: 'owner', value: 'sales' }, { property: 'type', value: 'snowflake_schema' }],
    });
  });

  it('drops what an earlier suggestion wrote for a type ODCS did not have yet', () => {
    const owner = { property: 'owner', value: 'sales' };
    for (const earlier of [{ type: 'exasol', schema: 'S' }, { type: 'iceberg', catalogUrl: 'https://example.com', namespace: 'n' }]) {
      const current = mergeAssetServer({ server: 'production', customProperties: [owner] }, serverForApiVersion(earlier, 'v3.1.0'));
      expect(current.customProperties.length).toBeGreaterThan(1);
      expect(mergeAssetServer(current, { type: 'postgres', host: 'h' }).customProperties).toEqual([owner]);
    }
  });

  it('names an unnamed server after the suggestion', () => {
    expect(mergeAssetServer({ type: 'snowflake' }, suggested).server).toBe('default');
  });

  it('never fills in an assetId', () => {
    const merged = mergeAssetServer({ server: 'production' }, suggested);

    expect(merged.customProperties).toEqual([{ property: 'type', value: 'snowflake_schema' }]);
  });
});
