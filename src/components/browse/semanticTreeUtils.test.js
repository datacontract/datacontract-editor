import { describe, it, expect } from 'vitest';
import { collectStandaloneIds, nodeToDefinition, nodeLinkUrls, nodeSelectionKey } from './semanticTreeUtils.js';
import { buildPropertyFromSemanticNode } from './browseInsert.js';

const HOST = 'https://app.example.com/acme';

// A property under the concept Customer, as the semantic tree of the host sends it
const emailNode = {
  externalId: 'customer_email',
  name: 'email',
  elementType: 'property',
  url: `${HOST}/semantics/crm/customer_email`,
  platformUrl: `${HOST}/semantics/crm/customer_email`,
  ontologyReference: {
    relationship: 'crm:Customer.email',
    relationshipType: 'hasProperty',
    url: `${HOST}/semantics/crm/Customer.email`,
  },
};

const conceptNode = {
  externalId: 'Customer',
  name: 'Customer',
  elementType: 'entity',
  url: 'http://example.com/crm/Customer',
  platformUrl: `${HOST}/semantics/crm/Customer`,
};

describe('nodeToDefinition', () => {
  it('links a property under a concept through the relationship', () => {
    expect(nodeToDefinition(emailNode).url).toBe(`${HOST}/semantics/crm/Customer.email`);
  });

  it('links a node without an ontology reference by its url', () => {
    expect(nodeToDefinition(conceptNode).url).toBe('http://example.com/crm/Customer');
    expect(nodeToDefinition({ ...emailNode, ontologyReference: null }).url).toBe(`${HOST}/semantics/crm/customer_email`);
  });

  it('links by the url of the node if the ontology reference has no url', () => {
    const node = { ...emailNode, ontologyReference: { relationship: 'crm:Customer.email' } };
    expect(nodeToDefinition(node).url).toBe(`${HOST}/semantics/crm/customer_email`);
  });
});

describe('nodeSelectionKey', () => {
  it('tells a shared property on its own from the same property under a concept', () => {
    const standalone = { ...emailNode, ontologyReference: null };
    expect(nodeSelectionKey(standalone)).not.toBe(nodeSelectionKey(emailNode));
    expect(nodeSelectionKey({ ...emailNode })).toBe(nodeSelectionKey(emailNode));
  });

  it('tells two concepts with the same IRI apart', () => {
    expect(nodeSelectionKey({ ...conceptNode, externalId: 'Client' })).not.toBe(nodeSelectionKey(conceptNode));
  });
});

describe('nodeLinkUrls', () => {
  it('matches only the relationship link for a property under a concept that also has its own row', () => {
    // A link to the property on its own belongs to the row of the property itself
    const tree = [{ ...conceptNode, children: [emailNode] }, { ...emailNode, ontologyReference: null }];
    const standaloneIds = collectStandaloneIds(tree);
    expect(nodeLinkUrls(emailNode, standaloneIds)).toEqual([`${HOST}/semantics/crm/Customer.email`]);
    expect(nodeLinkUrls({ ...emailNode, ontologyReference: null }, standaloneIds)).toEqual([`${HOST}/semantics/crm/customer_email`]);
  });

  it('also matches the links of the property itself when the tree has no row of its own for it', () => {
    const standaloneIds = collectStandaloneIds([{ ...conceptNode, children: [emailNode] }]);
    expect(nodeLinkUrls(emailNode, standaloneIds)).toEqual([
      `${HOST}/semantics/crm/Customer.email`,
      `${HOST}/semantics/crm/customer_email`,
    ]);
  });

  it('keeps the IRI and the platform url of a concept', () => {
    expect(nodeLinkUrls(conceptNode)).toEqual(['http://example.com/crm/Customer', `${HOST}/semantics/crm/Customer`]);
  });
});

describe('buildPropertyFromSemanticNode', () => {
  it('writes the relationship url for each property of a dropped concept', () => {
    const property = buildPropertyFromSemanticNode({ ...conceptNode, children: [emailNode] });

    expect(property.authoritativeDefinitions).toEqual([{ type: 'semantics', url: 'http://example.com/crm/Customer' }]);
    expect(property.properties[0].authoritativeDefinitions).toEqual([
      { type: 'semantics', url: `${HOST}/semantics/crm/Customer.email` },
    ]);
  });
});
