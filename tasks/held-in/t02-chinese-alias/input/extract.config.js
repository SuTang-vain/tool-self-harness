'use strict';
/*
 * extract.config.js - t02-chinese-alias
 * Pattern: "Chinese-name-reference library" (references/extraction-config.md)
 *   - entities keyed by stable slug ids, each carrying a Chinese display name
 *   - relations reference entities by DISPLAY NAME, not id
 *   - buildPack converts name refs -> ids and emits an aliases table (name -> id)
 */
const path = require('path');

const libDir = __dirname; // cwd == input (parent of lib/)

module.exports = {
  libId: 'family-tree',
  libDir: libDir,
  engineFile: 'lib/src/family-tree.js',
  globalName: 'FamilyTree',
  schemaVersion: '1.2',

  // 1. Slice the two embedded default-data literals out of the engine.
  literals: [
    { key: 'chars', pattern: /var chars = \(options && options\.chars\) \|\|/ },
    { key: 'edges', pattern: /var edges = \(options && options\.edges\) \|\|/ }
  ],

  meta: {
    title: '家族关系图',
    hero: 'zhangsan',
    source: 'engine-embedded-defaults'
  },

  // 2. Build a spec-compliant Data Pack from the sliced defaults.
  buildPack(defaults) {
    const chars = defaults.chars; // { zhangsan: {name,kind,title}, ... }
    const edges = defaults.edges; // [{ a:'张三', b:'李四', type, label }, ...]

    // display-name -> stable id (the aliases table; inverse lets us convert edges)
    const nameToId = {};
    Object.keys(chars).forEach(function (id) {
      nameToId[chars[id].name] = id;
    });

    return {
      meta: {
        title: '家族关系图',
        hero: 'zhangsan',
        source: 'engine-embedded-defaults'
      },
      // entities keyed by stable id; preserve business fields (name/kind/title)
      entities: chars,
      // aliases: each display name -> id  (so E4/E5 pass)
      aliases: nameToId,
      // relation-type registry (E6)
      relationTypes: {
        family: { label: '同族', color: '#8a8a8a' },
        marriage: { label: '联姻', color: '#c0392b' }
      },
      // master edge list with a/b converted from names -> ids (E5)
      relations: edges.map(function (e) {
        const r = {
          a: nameToId[e.a] || e.a,
          b: nameToId[e.b] || e.b,
          type: e.type
        };
        if (e.label !== undefined) r.label = e.label;
        return r;
      })
    };
  },

  // 3. Equivalence: __fromPack(pack) must deep-equal the embedded defaults.
  //    Engine returns { chars, allEdges }; defaults are { chars, edges }.
  equivalence: [
    { lit: 'chars', from: 'chars' },
    { lit: 'edges', from: 'allEdges' }
  ]
};
