async function update(id, fields) {
  return db.users.update({ id }, fields);
}
module.exports = { update };
