console.clear()
require('dotenv').config();
const mongoose = require('mongoose');
const moment = require('moment');

// // Function to pick a random location for a given Pokemon type
// async function pickLocation(pokemonType, userId) {

//   // Define the schema for the Location collection
//   const LocationSchema = new mongoose.Schema({
//     name: String,
//     type: String
//   }, {
//     collection: 'Locations' // specify the custom collection name
//   });

//   // Define the schema for the user collection
//   const UserSchema = new mongoose.Schema({
//     pokemon: {
//       currentLocation: String,
//       locationExpires: Date
//     }
//   });

//   // Define the Location and User models
//   const Locations = mongoose.model('Location', LocationSchema);

//   // Connect to the MongoDB database
//   await mongoose.connect(`mongodb://${process.env.MONGODB_SERVER}/Pokemon`);

//   // Find all locations that match the given Pokemon type (case-insensitive)
//   const locations = await Locations.find({ type: { $regex: new RegExp(pokemonType, 'i') } });
//   console.log(locations)

//   // Check if the locations array is empty
//   if (locations.length === 0) {
//     throw new Error(`No locations found for Pokemon type "${pokemonType}"`);
//   }

//   // Pick a random location from the list
//   const randomIndex = Math.floor(Math.random() * locations.length);
//   const randomLocation = locations[randomIndex];

//   // Set the expiration time for the location
//   const expirationTime = moment().add(Math.floor(Math.random() * 3) + 1, 'hours').toDate();

//   // Save the location and expiration time to the user's document in the database
//   const user = await mongoose.model(userId, UserSchema).findOneAndUpdate({}, {
//     'pokemon.currentLocation': randomLocation.name,
//     'pokemon.locationExpires': expirationTime
//   }, { upsert: true, new: true });

//   await mongoose.disconnect();

//   // Return the current location and expiration time
//   return {
//     currentLocation: user.pokemon.currentLocation,
//     locationExpires: user.pokemon.locationExpires
//   };
// }

// Connection URI
const uri = `mongodb://${process.env.MONGODB_SERVER}/InteractionHistory`;

// Connect to the MongoDB server
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");

    // Get a reference to the chats collection
    const Chat = mongoose.model("chats", {
      userId: String,
      timestamp: Date,
      content: String,
      pokedexNumber: String
    });

    // Query all chats from the "chats" collection
    Chat.find({})
      .then(function(chats) {
        console.log("Retrieved", chats.length, "chats:");

        // Log each chat
        chats.forEach(function(chat) {
          console.log(chat);
        });

        // Close the MongoDB connection
        mongoose.connection.close();
      })
      .catch(function(err) {
        console.log("Error retrieving chats:", err);

        // Close the MongoDB connection
        mongoose.connection.close();
      });
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });