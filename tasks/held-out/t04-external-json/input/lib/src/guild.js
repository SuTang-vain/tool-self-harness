'use strict';
/*
 * guild.js - external-JSON-data engine (synthetic t04 fixture, held-out)
 *
 * Default data lives in a separate <script type="application/json"> block in
 * the example HTML, not inline in the engine. This is the "external-JSON
 * library" pattern from extraction-config.md: the literal spec uses `file` +
 * `json: true` to slice from an HTML file.
 */
var Guild = (function () {
  var options = (typeof options !== 'undefined') ? options : undefined;
  // chars/edges come from an external JSON block, loaded at mount time
  var chars = (options && options.chars) || {};
  var edges = (options && options.edges) || [];

  function mount(root, options) {
    var o = options || {};
    return { chars: o.chars || chars, edges: o.edges || edges };
  }

  function __fromPack(pack) {
    var p = pack || {};
    // Reconstruct the members array and bonds array to match the external JSON
    // literal shape (equivalence test compares these against the sliced literals).
    var members = [];
    Object.keys(p.entities || {}).forEach(function (id) {
      members.push({ id: id, name: p.entities[id].name, kind: p.entities[id].kind });
    });
    var bonds = (p.relations || []).map(function (r) {
      return { a: r.a, b: r.b, type: r.type };
    });
    return { members: members, allEdges: bonds };
  }

  return { mount: mount, __fromPack: __fromPack };
})();

if (typeof globalThis !== 'undefined') globalThis.Guild = Guild;
