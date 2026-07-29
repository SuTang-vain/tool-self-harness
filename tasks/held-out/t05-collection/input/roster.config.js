'use strict';
/*
 * roster.config.js - sg-data-pack extraction config for the t05-collection
 * "collection / monolith" fixture.
 *
 * Engine (lib/src/roster.js) holds a single repeated item group: `members`,
 * an array of {id, name, role}. We slice that literal and lift it into a
 * spec-compliant Data Pack:
 *   - entities: keyed by member id, carry name + kind
 *   - aliases:  display name -> id (the normalization entry point)
 *   - relations: one self-loop per member, carrying the role as `label`
 *   - relationTypes: registers the `member` edge type used by the self-loops
 *   - provenance: record-level provenance for every entity + relation
 *     (skill principle #4: provenance is mandatory on all records)
 *
 * Losslessness is guaranteed by the equivalence test: the engine's __fromPack
 * rebuilds {members} from relations.a + entities[].name + relations[].label,
 * which must deep-equal the sliced default array.
 */
var path = require('path');

module.exports = {
  libId: 'roster',
  libDir: path.resolve(__dirname), // project root containing lib/
  engineFile: 'lib/src/roster.js',
  globalName: 'Roster',
  schemaVersion: '1.2',

  literals: [
    // Slice the `members` default array right after its `(options && options.members) ||` guard.
    { key: 'members', pattern: /var members = \(options && options\.members\) \|\|/ }
  ],

  meta: {
    title: 'Roster',
    source: 'engine-embedded-defaults'
  },

  buildPack: function (defaults) {
    var members = defaults.members;
    var entities = {};
    var aliases = {};
    var relations = [];
    var provEntities = {};
    var provRelations = {};

    // Baseline engine-embedded-defaults provenance: confidence 1.0 (original
    // case-page data). provenance is a parallel section that never invades
    // entity/relation bodies, so __fromPack is unaffected.
    var baseProv = {
      origin: 'engine-embedded-defaults',
      sourceUrl: null,
      fetchedAt: defaults.fetchedAt || '1970-01-01',
      confidence: 1.0,
      note: 'sliced from the engine default `members` literal'
    };

    members.forEach(function (m) {
      // entity: stable slug id is the key; body preserves name + kind
      entities[m.id] = { name: m.name, kind: 'member' };
      // alias: crawled/variant display name -> canonical id
      aliases[m.name] = m.id;
      // relation: self-loop per member, role carried as the edge label
      relations.push({ a: m.id, b: m.id, type: 'member', label: m.role });
      // provenance (entity keyed by id; relation keyed by 'a::b')
      provEntities[m.id] = Object.assign({}, baseProv);
      provRelations[m.id + '::' + m.id] = Object.assign({}, baseProv);
    });

    return {
      entities: entities,
      aliases: aliases,
      relationTypes: { member: { label: 'Member' } },
      relations: relations,
      provenance: {
        entities: provEntities,
        relations: provRelations
      }
    };
  },

  // __fromPack(pack).members must deep-equal the sliced `members` literal.
  equivalence: [
    { lit: 'members', from: 'members' }
  ],

  // Order-independent compare: sort both sides by id before deep-equal.
  sortKeys: {
    members: function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; }
  }
};
