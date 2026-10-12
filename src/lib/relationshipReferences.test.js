import { describe, it, expect } from 'vitest';
import { resolveReference, referencesProperty, isFullyQualifiedReference, isExternalReference } from './relationshipReferences.js';

// The example from ODCS references.md: schemas and properties carry both an id and a name.
const schemas = [
  {
    id: 'accounts_tbl',
    name: 'accounts',
    properties: [
      { id: 'acct_id_pk', name: 'id' },
      { id: 'owner_id_field', name: 'owner_id' },
      { id: 'address_field', name: 'address', properties: [{ id: 'street_field', name: 'street' }] },
    ],
  },
  {
    id: 'users_tbl',
    name: 'users',
    properties: [
      { id: 'user_id_field', name: 'user_id', relationships: [{ to: 'schema/accounts_tbl/properties/owner_id_field' }] },
    ],
  },
  { name: 'catalog.sales.orders', properties: [{ name: 'order_id' }] },
];

describe('resolveReference', () => {
  it('resolves the shorthand notation by name', () => {
    expect(resolveReference('accounts.owner_id', schemas)).toEqual({ schemaIndex: 0, propertyIndex: 1 });
  });

  it('resolves shorthand references to schemas whose names contain dots', () => {
    expect(resolveReference('catalog.sales.orders.order_id', schemas)).toEqual({ schemaIndex: 2, propertyIndex: 0 });
  });

  it('resolves the fully qualified notation by id', () => {
    expect(resolveReference('schema/accounts_tbl/properties/owner_id_field', schemas)).toEqual({ schemaIndex: 0, propertyIndex: 1 });
  });

  it('resolves fully qualified references with a leading slash or a same-contract anchor', () => {
    expect(resolveReference('/schema/accounts_tbl/properties/acct_id_pk', schemas)).toEqual({ schemaIndex: 0, propertyIndex: 0 });
    expect(resolveReference('#/schema/accounts_tbl/properties/acct_id_pk', schemas)).toEqual({ schemaIndex: 0, propertyIndex: 0 });
  });

  it('accepts names in the fully qualified notation when there are no ids, as in issue #15', () => {
    const withoutIds = [
      { name: 'address', properties: [{ name: 'address_id' }] },
      { name: 'client', properties: [{ name: 'address_id', relationships: [{ to: 'schema/address/properties/address_id' }] }] },
    ];
    expect(resolveReference('schema/address/properties/address_id', withoutIds)).toEqual({ schemaIndex: 0, propertyIndex: 0 });
  });

  it('prefers an id over a name', () => {
    const ambiguous = [
      { name: 'orders', properties: [] },
      { id: 'orders', name: 'orders_v2', properties: [{ id: 'order_id' }] },
    ];
    expect(resolveReference('schema/orders/properties/order_id', ambiguous)).toEqual({ schemaIndex: 1, propertyIndex: 0 });
  });

  it('resolves a reference to a whole schema without a property', () => {
    expect(resolveReference('schema/users_tbl', schemas)).toEqual({ schemaIndex: 1, propertyIndex: -1 });
  });

  it('reports an unknown property with propertyIndex -1', () => {
    expect(resolveReference('schema/accounts_tbl/properties/missing', schemas)).toEqual({ schemaIndex: 0, propertyIndex: -1 });
    expect(resolveReference('accounts.missing', schemas)).toEqual({ schemaIndex: 0, propertyIndex: -1 });
  });

  it('does not resolve nested properties, which have no row in the diagram', () => {
    expect(resolveReference('schema/accounts_tbl/properties/address_field/properties/street_field', schemas)).toBeNull();
  });

  it('does not resolve references into another contract', () => {
    expect(resolveReference('customer-contract.yaml#/schema/accounts_tbl/properties/acct_id_pk', schemas)).toBeNull();
    expect(resolveReference('https://example.com/contract.yaml#/schema/accounts_tbl', schemas)).toBeNull();
  });

  it('does not resolve unknown schemas or invalid input', () => {
    expect(resolveReference('schema/unknown/properties/id', schemas)).toBeNull();
    expect(resolveReference('unknown.id', schemas)).toBeNull();
    expect(resolveReference('', schemas)).toBeNull();
    expect(resolveReference(undefined, schemas)).toBeNull();
    expect(resolveReference('accounts.id', undefined)).toBeNull();
  });
});

describe('isFullyQualifiedReference', () => {
  it('tells the notations apart', () => {
    expect(isFullyQualifiedReference('schema/accounts_tbl/properties/acct_id_pk')).toBe(true);
    expect(isFullyQualifiedReference('other.yaml#/schema/accounts_tbl')).toBe(true);
    expect(isFullyQualifiedReference('accounts.id')).toBe(false);
    expect(isFullyQualifiedReference('schema.id')).toBe(false);
  });
});

describe('isExternalReference', () => {
  it('detects references into another contract', () => {
    expect(isExternalReference('customer-contract.yaml#/schema/customers_tbl')).toBe(true);
    expect(isExternalReference('#/schema/customers_tbl')).toBe(false);
    expect(isExternalReference('schema/customers_tbl')).toBe(false);
    expect(isExternalReference('customers.id')).toBe(false);
  });
});

describe('referencesProperty', () => {
  it('matches the same target in either notation', () => {
    expect(referencesProperty('accounts.owner_id', schemas, 0, 1)).toBe(true);
    expect(referencesProperty('schema/accounts_tbl/properties/owner_id_field', schemas, 0, 1)).toBe(true);
    expect(referencesProperty('schema/accounts_tbl/properties/owner_id_field', schemas, 0, 0)).toBe(false);
  });

  it('matches composite keys', () => {
    expect(referencesProperty(['accounts.id', 'schema/accounts_tbl/properties/owner_id_field'], schemas, 0, 1)).toBe(true);
  });
});
