const mongoose = require('mongoose');
const Location = require('./models/location');
const Nature = require('./models/nature');

const locationData = require('./data/locations.json');
const natureData = require('./data/natures.json');

async function seedDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Pokemon', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB');

    await Location.deleteMany({});
    console.log('Location collection cleared');

    await Location.insertMany(locationData);
    console.log('Location data inserted');

    await Nature.deleteMany({});
    console.log('Nature collection cleared');

    await Nature.insertMany(natureData);
    console.log('Nature data inserted');

    console.log('Seeding done');
    process.exit(0);
  } catch (error) {
    console.log('DB Connection error', error);
    process.exit(1);
  }
}

seedDB();
