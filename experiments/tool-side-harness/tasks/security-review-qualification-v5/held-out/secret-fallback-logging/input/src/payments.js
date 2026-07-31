const { paymentKey } = require('./config');
function client() { return new PaymentClient(paymentKey); }
module.exports = { client };
