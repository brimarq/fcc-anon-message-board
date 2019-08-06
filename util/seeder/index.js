const { Seeder } = require('mongo-seeding');

if (!process.env.MONGODB_URI) require('dotenv').config();

const path = require('path');

const config = {
  database: process.env.MONGODB_URI,
  dropDatabase: true,
};

const seeder = new Seeder(config);
const collections = seeder.readCollectionsFromPath(
  // path.resolve('./data')
  path.join(__dirname, 'data')
);

seeder
  .import(collections)
  .then(() => {
    console.log('Success');
  })
  .catch(err => {
    console.log('Error', err);
  });