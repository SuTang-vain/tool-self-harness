'use strict';
/*
 * SG Data Pack extraction config - t02 Chinese-name-reference library (Pattern B)
 *
 * Source engine (lib/src/family-tree.js):
 *   - chars keyed by stable id (zhangsan/lisi/wangwu), each carrying a Chinese `name`
 *   - edges reference entities by DISPLAY NAME (张三/李四/王五), not by id
 *
 * Conversion: build an idMap (name -> id) from chars, convert edges.a/b to ids,
 * and emit an aliases table (name -> id) so E4/E5 pass.
 */

const LIB_DIR = '/Users/tangyaoyue/DEV/tool-self-harness/tasks/held-in/t02-chinese-alias/input';

module.exports = {
  libId: 't02-chinese-alias',
  libDir: LIB_DIR,
  engineFile: 'lib/src/family-tree.js',
  globalName: 'FamilyTree',

  // Slice both default-data literals. Pattern ends at the trailing `||` (expression start).
  literals: [
    { key: 'chars', pattern: /var chars = \(options && options\.chars\) \|\|/ },
    { key: 'edges', pattern: /var edges = \(options && options\.edges\) \|\|/ }
  ],

  meta: {
    title: '家族关系图 (Chinese-name-reference)',
    hero: 'zhangsan',
    source: 'Embedded data from original case page (decomposition export)',
    fetchedAt: new Date().toISOString().slice(0, 10)
  },

  buildPack(defaults) {
    const chars = defaults.chars || {};
    const edges = defaults.edges || [];

    // name -> id map (the core of the Chinese-name-reference conversion)
    const idMap = {};
    for (const [id, c] of Object.entries(chars)) idMap[c.name] = id;

    // ① Entity table: stable id keys, preserve name/kind + all business fields (title, ...)
    const entities = {};
    for (const [id, c] of Object.entries(chars)) {
      entities[id] = Object.assign({}, c); // keeps name, kind, title
    }

    // ② Alias table: display name -> id (crawl-normalization entry point; satisfies E4/E5)
    const aliases = {};
    for (const [id, c] of Object.entries(chars)) aliases[c.name] = id;

    // ③ Relationship-type registry (every relations[].type must be registered -> E6)
    const relationTypes = {
      family: { label: '同族', color: '#d94b4b' },
      marriage: { label: '联姻', color: '#4b7bd9' }
    };

    // ④ Master edge list: convert display-name refs -> ids (a/b are ids, not names)
    const relations = edges.map((e) => {
      const rel = {
        a: idMap[e.a] || e.a,
        b: idMap[e.b] || e.b,
        type: e.type
      };
      if (e.label) rel.label = e.label;
      return rel;
    });

    const pack = {
      entities,
      aliases,
      relationTypes,
      relations,
      domain: {}
    };

    // ⑤ Provenance stamping (mandatory in v1.2; generic stamp, never hand-written)
    const stamp = (origin) => ({
      origin,
      sourceUrl: null,
      fetchedAt: new Date().toISOString().slice(0, 10),
      confidence: 1.0,
      note: 'Baseline data (embedded in original case page); original sourceUrl lost'
    });
    pack.provenance = {
      entities: Object.fromEntries(
        Object.keys(pack.entities).map((id) => [id, stamp('engine-embedded-defaults')])
      ),
      relations: Object.fromEntries(
        pack.relations.map((r) => [r.a + '::' + r.b, stamp('engine-embedded-defaults')])
      )
    };

    return pack;
  },

  // Losslessness check: fromPack(pack)[from] deep-equals defaults[lit]
  // __fromPack returns { chars (id-keyed, name/kind/title), allEdges (name-based a/b) }
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
