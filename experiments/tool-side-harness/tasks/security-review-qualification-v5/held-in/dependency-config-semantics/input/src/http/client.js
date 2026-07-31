const axios = require('axios');
async function fetchStatus() { return axios.get('https://status.example.test/health', { timeout: 2000 }); }
module.exports = { fetchStatus };
