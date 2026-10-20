import { describe, expect, it } from 'vitest';
import { mergeAssetServer } from './mergeAssetServer.js';

const suggested = {
  server: 'default',
  type: 'snowflake',
  account: 'acme',
  database: 'SHOP',
  schema: 'SALES',
  host: null,
  customProperties: [{ property: 'assetId', value: 'shop-sales' }],
};

describe('mergeAssetServer', () => {
  it('replaces the type-specific fields and keeps the server-level ones', () => {
    const current = {
      server: 'production',
      environment: 'prod',
      description: 'Main warehouse',
      type: 'postgres',
      host: 'db.example.com',
      customProperties: [{ property: 'owner', value: 'sales' }, { property: 'assetId', value: 'old' }],
    };

    expect(mergeAssetServer(current, suggested)).toEqual({
      server: 'production',
      environment: 'prod',
      description: 'Main warehouse',
      type: 'snowflake',
      account: 'acme',
      database: 'SHOP',
      schema: 'SALES',
      customProperties: [{ property: 'owner', value: 'sales' }, { property: 'assetId', value: 'shop-sales' }],
    });
  });

  it('names an unnamed server after the suggestion', () => {
    expect(mergeAssetServer({ type: 'snowflake' }, suggested).server).toBe('default');
  });
});
