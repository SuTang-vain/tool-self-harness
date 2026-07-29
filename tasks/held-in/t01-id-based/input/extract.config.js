'use strict';
/*
 * Extraction config for the t01-id-based char-graph library.
 * Source data is id-based (Pattern A): chars use semantic keys, edges are explicit.
 */

const LIB_DIR = '/Users/tangyaoyue/DEV/tool-self-harness/tasks/held-in/t01-id-based/input';

module.exports = {
  libId: 'char-graph',
  libDir: LIB_DIR,
  engineFile: 'lib/src/char-graph.js',
  globalName: 'CharGraph',
  schemaVersion: '1.2',

  // Default-data literal slicing (losslessness baseline).
  literals: [
    { key: 'chars', pattern: /var chars = \(options && options\.chars\) \|\|/ },
    { key: 'edges', pattern: /var edges = \(options && options\.edges\) \|\|/ }
  ],

  meta: {
    title: 'Character Graph',
    source: 'Embedded data from original case page (decomposition export)',
    fetchedAt: new Date().toISOString().slice(0, 10)
  },

  buildPack(defaults) {
    // ① Entity table. The embedded chars already carry `kind`, so they map 1:1.
    const entities = {};
    for (const [id, c] of Object.entries(defaults.chars)) {
      entities[id] = c;
    }

    // ② Alias table: display name -> id (crawl-normalization entry point).
    const aliases = {};
    for (const [id, c] of Object.entries(defaults.chars)) aliases[c.name] = id;

    // ③ Relationship-type registry: register every edge type used.
    const relationTypes = {
      family: { label: 'Family' }
    };

    // ④ Master edge list, derived from the embedded edges.
    //    A label is added so W3 (missing label) is not triggered under --strict.
    const relations = defaults.edges.map((e) => ({
      a: e.a,
      b: e.b,
      type: e.type,
      label: relationTypes[e.type] ? relationTypes[e.type].label : e.type
    }));

    const pack = {
      entities,
      aliases,
      relationTypes,
      relations
    };

    // ⑤ Provenance stamping (mandatory in v1.2, generic stamp function).
    const stamp = () => ({
      origin: 'engine-embedded-defaults',
      sourceUrl: null,
      fetchedAt: new Date().toISOString().slice(0, 10),
      confidence: 1.0,
      note: 'Baseline data (embedded in original case page); original sourceUrl lost'
    });
    pack.provenance = {
      entities: Object.fromEntries(Object.keys(pack.entities).map((id) => [id, stamp()])),
      relations: Object.fromEntries(pack.relations.map((r) => [r.a + '::' + r.b, stamp()]))
    };

    return pack;
  },

  // Losslessness check: fromPack(pack)[from] deep-equals defaults[lit]
  equivalence: [
    { lit: 'chars', from: 'chars' },
    { lit: 'edges', from: 'allEdges' }
  ],

  domainSchema: {
    type: 'object',
    description: 'Library-specific data collections',
    additionalProperties: true
  }
};
