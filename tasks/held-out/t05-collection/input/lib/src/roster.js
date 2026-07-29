'use strict';
/*
 * roster.js - collection-page engine (synthetic t05 fixture, held-out)
 *
 * A whole-page static template with a repeated item group (member cards).
 * The collection data is an array literal. This is the "collection / monolith"
 * pattern: the skill's templatize subcommand derives item templates from
 * repeated HTML instances.
 */
var Roster = (function () {
  var options = (typeof options !== 'undefined') ? options : undefined;
  var members = (options && options.members) || [
    { id: 'm1', name: 'Alice', role: 'Captain' },
    { id: 'm2', name: 'Bob', role: 'Engineer' },
    { id: 'm3', name: 'Carol', role: 'Designer' }
  ];

  function mount(root, options) {
    var m = (options && options.members) || members;
    return { members: m };
  }

  function __fromPack(pack) {
    var p = pack || {};
    // Reconstruct members: id from relation.a, name from entity, role from relation.label
    var ents = p.entities || {};
    var restored = (p.relations || []).map(function (r) {
      var ent = ents[r.a] || {};
      return { id: r.a, name: ent.name || r.a, role: r.label || '' };
    });
    return { members: restored };
  }

  return { mount: mount, __fromPack: __fromPack };
})();

if (typeof globalThis !== 'undefined') globalThis.Roster = Roster;
