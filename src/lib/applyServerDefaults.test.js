import { describe, expect, it } from 'vitest';
import { applyServerDefaults } from './applyServerDefaults.js';

describe('applyServerDefaults', () => {
  it('fills the fields the server leaves empty', () => {
    const server = { server: 'production', type: 'dremio', schema: '' };

    expect(applyServerDefaults(server, { host: 'dremio.example.com', port: 9047 })).toEqual({
      server: 'production',
      type: 'dremio',
      schema: '',
      host: 'dremio.example.com',
      port: 9047,
    });
  });

  it('keeps what the user already entered', () => {
    const server = { type: 'dremio', host: 'other.example.com' };

    expect(applyServerDefaults(server, { host: 'dremio.example.com', port: 9047 })).toEqual({
      type: 'dremio',
      host: 'other.example.com',
      port: 9047,
    });
  });

  it('never takes the name, type or other server-level fields from the defaults', () => {
    const server = { type: 'dremio' };

    expect(applyServerDefaults(server, { server: 'x', type: 'postgres', environment: 'prod', roles: [], customProperties: [] }))
      .toEqual({ type: 'dremio' });
  });

  it('leaves the server as it is without usable defaults', () => {
    const server = { type: 'dremio' };

    expect(applyServerDefaults(server, {})).toEqual(server);
    expect(applyServerDefaults(server, null)).toBe(server);
    expect(applyServerDefaults(server, ['host'])).toBe(server);
  });
});
