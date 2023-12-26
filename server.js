//database configuration
// error handeling
// environment variables
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const port = process.env.PORT || 3000;
// basically we are listening the unhandle promise for async codes
process.on('unhandledRejection', (err) => {
  // listening to an event
  console.log(err);
  console.log('Unhandle Rejection: 🌟 Shutting Down...');
  process.exit(1);
  // first we close the server. we give time to server to finish the request whatever it is handeling
});

process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('Unhandle Exception: 🌟 Shutting Down...');
  //server.close(); // first we close the server. we give time to server to finish the request whatever it is handeling
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

//console.log(process.env);
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    //console.log(con.connections);
    console.log('DB Connection Established');
  });

const server = app.listen(port, () => {
  console.log(`App running on ${port}...`);
});
