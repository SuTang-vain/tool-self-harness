function authenticate(req, res, next) {
  const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
  const claims = verifyJwt(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  req.user = { id: claims.sub, tenantId: claims.tenant, role: claims.role };
  next();
}
module.exports = { authenticate };
