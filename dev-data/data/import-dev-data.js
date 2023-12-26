//database configuration
// error handeling
// environment variables
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const port = process.env.PORT || 3000;
const Tour = require('./../../models/tourModels');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModels');

dotenv.config({ path: './config.env' });
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

//  read json file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf8')
);

//Import Data Into DB

const importData = async () => {
  try {
    await Tour.create(tours); // changing JSON to js object
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data Imported');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//Delete All Data from DB

const deleteData = async () => {
  try {
    await Tour.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});
    console.log('Data Deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

console.log(process.argv[2]);
if (process.argv[2] === '--import') {
  importData();
}

if (process.argv[2] === '--delete') {
  console.log('Deleteing Data from DB');
  deleteData();
}
