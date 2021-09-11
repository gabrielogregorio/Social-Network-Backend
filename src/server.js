let {app, mongoose}  = require('../src/app');

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
  console.log('server is running!');
})

