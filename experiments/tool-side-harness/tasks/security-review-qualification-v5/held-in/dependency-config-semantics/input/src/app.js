const cors = require('cors');
const helmet = require('helmet');
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use('/api', api);
