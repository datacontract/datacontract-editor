import { describe, it, expect } from 'vitest';
import { buildReferencedByName } from './layoutUtils.js';

describe('buildReferencedByName', () => {
  it('marks properties referenced in either notation', () => {
    const schemas = [
      { id: 'accounts_tbl', name: 'accounts', properties: [{ id: 'acct_id_pk', name: 'id' }, { id: 'owner_id_field', name: 'owner_id' }] },
      {
        id: 'users_tbl',
        name: 'users',
        properties: [
          { name: 'user_id', relationships: [{ to: 'schema/accounts_tbl/properties/owner_id_field' }] },
          { name: 'account_id', relationships: [{ to: 'accounts.id' }] },
        ],
      },
    ];
    expect(buildReferencedByName(schemas)).toEqual({ accounts: new Set(['owner_id', 'id']), users: new Set() });
  });
});
