'use strict';
/*
 * Extraction config for char-graph (t01-id-based)
 */

const LIB_DIR = '/Users/tangyaoyue/DEV/tool-self-harness/tasks/held-in/t01-id-based/input';

module.exports = {
  libId: 'char-graph',
  libDir: LIB_DIR,
  engineFile: 'lib/src/char-graph.js',
  globalName: 'CharGraph',

  literals: [
    { key: 'chars', pattern: /var chars = \(options && options\.chars\) \|\|/ },
    { key: 'edges', pattern: /var edges = \(options && options\.edges\) \|\|/ },
  ],

  meta: {
    title: 'Character Graph (id-based)',
    hero: 'alice',
    source: 'Embedded data from original case page (decomposition export)',
    fetchedAt: new Date().toISOString().slice(0, 10)
  },

  buildPack(defaults) {
    // ① Entity table: chars already have `kind`, use directly
    const entities = {};
    for (const [id, c] of Object.entries(defaults.chars)) {
      entities[id] = Object.assign({}, c);
    }

    // ② Alias table: display name → id
    const aliases = {};
    for (const [id, c] of Object.entries(defaults.chars)) {
      aliases[c.name] = id;
    }

    // ③ Relation-type registry
    const relationTypes = {
      family: { label: 'Family' },
    };

    // ④ Master edge list
    const relations = (defaults.edges || []).map(function (e) {
      return { a: e.a, b: e.b, type: e.type, label: e.type };
    });

    const pack = {
      entities,
      aliases,
      relationTypes,
      relations,
    };

    // ⑤ Provenance stamping
    const stamp = function (origin) {
      return {
        origin: origin,
        sourceUrl: null,
        fetchedAt: new Date().toISOString().slice(0, 10),
        confidence: 1.0,
        note: 'Baseline data (embedded in original case page); original sourceUrl lost'
      };
    };
    pack.provenance = {
      entities: Object.fromEntries(Object.keys(pack.entities).map(function (id) { return [id, stamp('engine-embedded-defaults')]; })),
      relations: Object.fromEntries(pack.relations.map(function (r) { return [r.a + '::' + r.b, stamp('engine-embedded-defaults')]; }))
    };

    return pack;
  },

  // Losslessness check: fromPack(pack)[from] deep-equals defaults[lit]
  equivalence: [
    { lit: 'chars', from: 'chars' },
    { lit: 'edges', from: 'allEdges' },
  ],

  domainSchema: {
    type: 'object',
    description: 'Library-specific data collections',
    additionalProperties: true
  }
};
