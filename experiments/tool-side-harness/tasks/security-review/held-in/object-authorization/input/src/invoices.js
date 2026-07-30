const rows = new Map([
  ['inv-1', { id: 'inv-1', ownerId: 'user-a', total: 150 }],
  ['inv-2', { id: 'inv-2', ownerId: 'user-b', total: 220 }]
]);
async function findById(id) { return rows.get(id); }
module.exports = { findById };
