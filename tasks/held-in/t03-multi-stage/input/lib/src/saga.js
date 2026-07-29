'use strict';
/*
 * saga.js - multi-stage narrative engine (synthetic t03 fixture)
 *
 * Two stages share the same entities but relationships evolve across stages
 * (E12: multiple edges on the same (a,b) pair must be disambiguated by scope).
 */
var Saga = (function () {
  var options = (typeof options !== 'undefined') ? options : undefined;
  var chars = (options && options.chars) || {
    hero: { name: 'Hero', kind: 'person' },
    ally: { name: 'Ally', kind: 'person' },
    foe: { name: 'Foe', kind: 'person' }
  };
  // Stage 1 edges
  var stage1Edges = (options && options.stage1Edges) || [
    { a: 'hero', b: 'ally', type: 'alliance' }
  ];
  // Stage 2 edges (hero & ally now conflict, hero & foe fight)
  var stage2Edges = (options && options.stage2Edges) || [
    { a: 'hero', b: 'ally', type: 'rivalry' },
    { a: 'hero', b: 'foe', type: 'conflict' }
  ];

  /* ============ SG Data Pack support ============ */
  function __fromPack(pack) {
    var p = pack || {};
    var restoredChars = {};
    Object.keys(p.entities || {}).forEach(function (id) {
      restoredChars[id] = { name: p.entities[id].name, kind: p.entities[id].kind };
    });
    // Reconstruct per-stage edges from the scope field (scope is an array of stage keys)
    var s1 = [], s2 = [];
    (p.relations || []).forEach(function (r) {
      var edge = { a: r.a, b: r.b, type: r.type };
      var scopes = Array.isArray(r.scope) ? r.scope : (r.scope ? [r.scope] : []);
      if (scopes.indexOf('stage1') !== -1) s1.push(edge);
      if (scopes.indexOf('stage2') !== -1) s2.push(edge);
    });
    return { chars: restoredChars, stage1AllEdges: s1, stage2AllEdges: s2 };
  }
  function __resolveDataOptions(options) {
    if (!options || !options.data) return options;
    if (typeof SGDataLoader !== 'undefined') {
      SGDataLoader.assertValid(options.data); // fail loudly, never silently
    } else if (typeof console !== 'undefined' && console.error) {
      console.error('[engine] options.data not validated: include lib/src/sg-data-loader.js first');
    }
    var d = __fromPack(options.data);
    var merged = {};
    Object.keys(options).forEach(function (k) { merged[k] = options[k]; });
    // pack wins: map fromPack outputs back onto the legacy option keys
    if (d.chars !== undefined) merged.chars = d.chars;
    if (d.stage1AllEdges !== undefined) merged.stage1Edges = d.stage1AllEdges;
    if (d.stage2AllEdges !== undefined) merged.stage2Edges = d.stage2AllEdges;
    return merged;
  }
  /* ========== SG Data Pack support (end) ========== */

  function mount(root, options) {
    options = __resolveDataOptions(options); // first line - prefer injected Data Pack
    return {
      chars: (options && options.chars) || chars,
      stage1Edges: (options && options.stage1Edges) || stage1Edges,
      stage2Edges: (options && options.stage2Edges) || stage2Edges
    };
  }

  return { mount: mount, __fromPack: __fromPack, __resolveDataOptions: __resolveDataOptions };
})();

if (typeof globalThis !== 'undefined') globalThis.Saga = Saga;
