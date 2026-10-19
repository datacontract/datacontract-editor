import { describe, it, expect } from 'vitest';
import { getTableKind } from './tableKind.js';

describe('getTableKind', () => {
  it('detects fact and dimension tables by prefix', () => {
    expect(getTableKind('fct_orders')).toBe('fact');
    expect(getTableKind('FACT_sales')).toBe('fact');
    expect(getTableKind('dim_customer')).toBe('dimension');
  });

  it('returns null for other tables', () => {
    expect(getTableKind('orders')).toBeNull();
    expect(getTableKind('dimension')).toBeNull();
    expect(getTableKind(undefined)).toBeNull();
  });
});
