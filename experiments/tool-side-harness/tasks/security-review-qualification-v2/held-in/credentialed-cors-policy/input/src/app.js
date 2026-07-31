const cors = require('cors');
app.use(cors({ origin: true, credentials: true }));
app.use('/api', apiRouter);
