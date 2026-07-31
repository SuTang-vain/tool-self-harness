async function byEmail(email) {
  return db.oneOrNone('select id from users where email = $1', [email]);
}
module.exports = { byEmail };
