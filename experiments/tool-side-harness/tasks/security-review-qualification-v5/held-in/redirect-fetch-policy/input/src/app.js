const preview = require('./routes/preview');
const continuation = require('./routes/continue');
const avatar = require('./routes/avatar');
app.get('/preview', preview);
app.get('/continue', continuation);
app.get('/avatar', avatar);
