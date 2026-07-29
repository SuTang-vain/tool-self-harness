'use strict';
/*
 * SG Data Pack extraction config for saga.js (t03 multi-stage fixture)
 *
 * Multi-stage pattern:
 *   - Entities (chars) are shared across stages.
 *   - Edges are split into stage1Edges / stage2Edges.
 *   - The same (hero,ally) pair has DIFFERENT relationship types per stage
 *     (alliance vs rivalry), so each master edge carries a `scope` array to
 *     satisfy E12 disambiguation.
 *   - Master `relations` = union of per-stage edges (deduped); provenance
 *     relations keys use `a::b` deduped by pair.
 *   - `stages` declares both stages with entity membership + per-stage relation refs.
 */

const path = require('path');
const LIB_DIR = path.resolve(__dirname);

// Sort key for edges so the equivalence comparison is order-insensitive.
const edgeKey = (e) => e.a + '::' + e.b + '::' + e.type;

module.exports = {
  libId: 'saga',
  libDir: LIB_DIR,
  engineFile: 'lib/src/saga.js',
  globalName: 'Saga',
  schemaVersion: '1.2',

  literals: [
    { key: 'chars', pattern: /var chars = \(options && options\.chars\) \|\|/ },
    { key: 'stage1Edges', pattern: /var stage1Edges = \(options && options\.stage1Edges\) \|\|/ },
    { key: 'stage2Edges', pattern: /var stage2Edges = \(options && options\.stage2Edges\) \|\|/ }
  ],

  meta: {
    title: 'Saga — multi-stage narrative',
    hero: 'hero',
    source: 'Embedded data from original case page (decomposition export)',
    fetchedAt: new Date().toISOString().slice(0, 10)
  },

  buildPack(defaults) {
    // ① Entity table: chars already keyed by stable id; add kind (already present).
    const entities = {};
    for (const [id, c] of Object.entries(defaults.chars)) {
      entities[id] = { name: c.name, kind: c.kind };
    }

    // ② Alias table: display name -> id (crawl-normalization entry point).
    const aliases = {};
    for (const [id, c] of Object.entries(defaults.chars)) aliases[c.name] = id;

    // ③ Relationship-type registry (all enum values used by the engine).
    const relationTypes = {
      alliance: { label: 'Alliance', color: '#4b8b4b' },
      rivalry: { label: 'Rivalry', color: '#d9a44b' },
      conflict: { label: 'Conflict', color: '#d94b4b' }
    };

    // ④ Master edge list = UNION of per-stage edges.
    //    The (hero,ally) pair appears twice with different types; each edge is
    //    tagged with a `scope` array naming the stage it is active in, so E12
    //    disambiguation passes (a stage {a,b} ref resolves to exactly one edge
    //    via scope).
    const relations = [];
    defaults.stage1Edges.forEach(function (e) {
      relations.push({ a: e.a, b: e.b, type: e.type, label: relationTypes[e.type].label, scope: ['stage1'] });
    });
    defaults.stage2Edges.forEach(function (e) {
      relations.push({ a: e.a, b: e.b, type: e.type, label: relationTypes[e.type].label, scope: ['stage2'] });
    });

    // ⑤ Stages: declare both stages with entity membership + per-stage relation refs.
    //    Relations reference master edges by {a,b}; never duplicate edge fields.
    const stage1Members = Object.keys(entities);
    const stage2Members = Object.keys(entities);
    const stages = [
      {
        key: 'stage1',
        name: 'Stage One',
        desc: 'The alliance era — hero and ally stand together.',
        entities: stage1Members,
        relations: defaults.stage1Edges.map(function (e) { return { a: e.a, b: e.b }; })
      },
      {
        key: 'stage2',
        name: 'Stage Two',
        desc: 'The schism — hero and ally clash, and the foe enters.',
        entities: stage2Members,
        relations: defaults.stage2Edges.map(function (e) { return { a: e.a, b: e.b }; })
      }
    ];

    const pack = {
      entities: entities,
      aliases: aliases,
      relationTypes: relationTypes,
      relations: relations,
      stages: stages,
      domain: {}
    };

    // ⑥ Provenance stamping (mandatory in v1.2).
    //    relations keys use `a::b` deduped by pair (hero::ally appears once).
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
      relations: Object.fromEntries(
        pack.relations
          .map(function (r) { return r.a + '::' + r.b; })
          .filter(function (k, i, arr) { return arr.indexOf(k) === i; })
          .map(function (k) { return [k, stamp('engine-embedded-defaults')]; })
      )
    };

    return pack;
  },

  // Losslessness: __fromPack(pack) returns {chars, stage1AllEdges, stage2AllEdges};
  // compare against the sliced defaults {chars, stage1Edges, stage2Edges}.
  equivalence: [
    { lit: 'chars', from: 'chars' },
    { lit: 'stage1Edges', from: 'stage1AllEdges' },
    { lit: 'stage2Edges', from: 'stage2AllEdges' }
  ],

  // Edges are reconstructed by scope-filtering the master list, so compare
  // order-insensitively.
  sortKeys: {
    stage1Edges: function (x, y) { return edgeKey(x).localeCompare(edgeKey(y)); },
    stage2Edges: function (x, y) { return edgeKey(x).localeCompare(edgeKey(y)); }
  },

  domainSchema: {
    type: 'object',
    description: 'Library-specific data collections (none for this fixture)',
    additionalProperties: true
  }
};
