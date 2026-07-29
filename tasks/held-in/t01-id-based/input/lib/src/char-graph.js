'use strict';
/*
 * char-graph.js - minimal id-based character graph engine (synthetic test fixture for sg-data-pack)
 *
 * Default data is embedded as literals; mount() accepts options to override.
 * __fromPack reconstructs the defaults from a Data Pack (used by the equivalence test).
 */
var CharGraph = (function () {
  var options = (typeof options !== 'undefined') ? options : undefined; // browser-global guard
  var chars = (options && options.chars) || {
    alice: { name: 'Alice', kind: 'person' },
    bob: { name: 'Bob', kind: 'person' }
  };
  var edges = (options && options.edges) || [
    { a: 'alice', b: 'bob', type: 'family' }
  ];

  function mount(root, options) {
    options = options || {};
    var c = (options && options.chars) || chars;
    var e = (options && options.edges) || edges;
    // rendering omitted - data layer only
    return { chars: c, edges: e };
  }

  // Reconstruct engine defaults from a Data Pack (equivalence-test hook)
  function __fromPack(pack) {
    var p = pack || {};
    return {
      chars: Object.assign({}, p.entities || {}),
      allEdges: (p.relations || []).map(function (r) {
        return { a: r.a, b: r.b, type: r.type };
      })
    };
  }

  return { mount: mount, __fromPack: __fromPack };
})();

// expose for both browser-global and Node (equivalence test runs under Node)
if (typeof globalThis !== 'undefined') globalThis.CharGraph = CharGraph;
