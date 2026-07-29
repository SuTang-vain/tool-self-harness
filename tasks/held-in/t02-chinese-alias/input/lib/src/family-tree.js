'use strict';
/*
 * family-tree.js - Chinese-name-reference character engine (synthetic t02 fixture)
 *
 * Entities use Chinese names as keys (no stable ids); relations reference by name.
 * This is the "Chinese-name-reference library" pattern from extraction-config.md:
 * the model must convert names to stable ids via a hand-written idMap, then build
 * an aliases table mapping display names -> ids. E5/E7 explode if names aren't
 * normalized.
 */
var FamilyTree = (function () {
  var options = (typeof options !== 'undefined') ? options : undefined;
  var chars = (options && options.chars) || {
    zhangsan: { name: '张三', kind: 'person', title: '家主' },
    lisi: { name: '李四', kind: 'person', title: '族弟' },
    wangwu: { name: '王五', kind: 'person', title: '姻亲' }
  };
  var edges = (options && options.edges) || [
    { a: '张三', b: '李四', type: 'family', label: '同族' },
    { a: '张三', b: '王五', type: 'marriage', label: '联姻' }
  ];

  function mount(root, options) {
    var c = (options && options.chars) || chars;
    var e = (options && options.edges) || edges;
    return { chars: c, edges: e };
  }

  // Reconstruct engine defaults from a Data Pack (equivalence-test hook).
  // IMPORTANT: the engine's native keys are Chinese names, NOT ids. So fromPack
  // must map id-based entities/relations back to name-based form.
  function __fromPack(pack) {
    var p = pack || {};
    var idToName = {};
    var restoredChars = {};
    Object.keys(p.entities || {}).forEach(function (id) {
      var ent = p.entities[id];
      var name = ent.name;
      idToName[id] = name;
      restoredChars[id] = { name: name, kind: ent.kind };
      if (ent.title) restoredChars[id].title = ent.title;
    });
    var restoredEdges = (p.relations || []).map(function (r) {
      var edge = { a: idToName[r.a] || r.a, b: idToName[r.b] || r.b, type: r.type };
      if (r.label) edge.label = r.label;
      return edge;
    });
    return { chars: restoredChars, allEdges: restoredEdges };
  }

  return { mount: mount, __fromPack: __fromPack };
})();

if (typeof globalThis !== 'undefined') globalThis.FamilyTree = FamilyTree;
