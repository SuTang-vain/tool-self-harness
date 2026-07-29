'use strict';
/*
 * SG Data Pack extraction config - t04 external-JSON guild library.
 * Pattern C (external JSON-script library): data lives in a
 * <script id="sg-data" type="application/json"> block in the example HTML.
 *
 * libDir is the input/ root so the engine lives at lib/src/guild.js and the
 * pack is written to lib/data/data.json (the script appends 'lib/data').
 */

const LIB_DIR = '/Users/tangyaoyue/DEV/tool-self-harness/tasks/held-out/t04-external-json/input';

module.exports = {
  libId: 'guild',
  libDir: LIB_DIR,
  engineFile: 'lib/src/guild.js',
  globalName: 'Guild',
  schemaVersion: '1.2',

  // External JSON block: file + json:true slices the JSON object out of the HTML.
  // A second (acorn-sliced) literal gives the bonds array standalone, for the
  // equivalence test (the engine's __fromPack drops `role` from members, so only
  // the bonds -> allEdges round-trip is losslessly comparable).
  literals: [
    {
      key: 'data',
      file: 'lib/examples/guild.html',
      pattern: /<script id="sg-data" type="application\/json">/,
      json: true
    },
    {
      key: 'bonds',
      file: 'lib/examples/guild.html',
      pattern: /"bonds":\s*/
    }
  ],

  meta: {
    title: 'Guild',
    hero: 'leader',
    source: 'External JSON block in example HTML (lib/examples/guild.html)',
    fetchedAt: new Date().toISOString().slice(0, 10)
  },

  buildPack(defaults) {
    const data = defaults.data;

    // ① entities from members (keyed by id, with name + kind)
    const entities = {};
    for (const m of data.members) {
      entities[m.id] = { name: m.name, kind: m.kind };
    }

    // ② aliases: display name -> id
    const aliases = {};
    for (const m of data.members) aliases[m.name] = m.id;

    // ③ relationTypes: register every bond type used (label = type itself)
    const relationTypes = {};
    for (const b of data.bonds) {
      if (!relationTypes[b.type]) relationTypes[b.type] = { label: b.type };
    }

    // ④ relations from bonds (a/b/type); add label (= type) to satisfy W3 and
    //    keep strict validation clean. __fromPack only reads {a,b,type}, so the
    //    extra field does not affect the losslessness round-trip.
    const relations = data.bonds.map(function (b) {
      return { a: b.a, b: b.b, type: b.type, label: b.type };
    });

    const pack = {
      entities: entities,
      aliases: aliases,
      relationTypes: relationTypes,
      relations: relations
    };

    // ⑤ provenance stamping (v1.2 mandatory)
    const stamp = function () {
      return {
        origin: 'engine-embedded-defaults',
        sourceUrl: null,
        fetchedAt: new Date().toISOString().slice(0, 10),
        confidence: 1.0,
        note: 'Baseline data (external JSON block in example HTML); original sourceUrl lost'
      };
    };
    pack.provenance = {
      entities: Object.fromEntries(Object.keys(pack.entities).map(function (id) { return [id, stamp()]; })),
      relations: Object.fromEntries(pack.relations.map(function (r) { return [r.a + '::' + r.b, stamp()]; }))
    };

    return pack;
  },

  // Losslessness: fromPack(pack).allEdges deep-equals the sliced bonds literal.
  equivalence: [
    { lit: 'bonds', from: 'allEdges' }
  ],

  domainSchema: {
    type: 'object',
    description: 'Library-specific data collections',
    additionalProperties: true
  }
};
