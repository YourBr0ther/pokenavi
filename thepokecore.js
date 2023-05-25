console.clear()
require('dotenv').config();
const mongoose = require('mongoose');
const moment = require('moment');
const Locations = require('./models/location');

// Function to pick a random location for a given Pokemon type
async function updatePokemonLocations() {

  const PCSchema = new mongoose.Schema({
    'pokemon.name': String,
    'pokemon.type1': String,
    'pokemon.currentLocation': { type: String, default: null },
    'pokemon.locationExpires': { type: Date, default: null }
  }, {
    collection: 'PC' // specify the custom collection name
  });

  // Define the Location and Pokemon models if they haven't been defined yet
  const PC = mongoose.models.PC || mongoose.model('PC', PCSchema);

  // connect to the MongoDB database at the top level of your code
  await mongoose.connect(`mongodb://${process.env.MONGODB_SERVER}/Pokemon`)
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

  // Get all Pokemons
  const pokemons = await PC.find(); // Changed from Pokemons to PC

  // Iterate over each Pokemon
  for (let pokemon of pokemons) {
    // If the location has expired or doesn't exist, update it
    if (!pokemon.pokemon.currentLocation || !pokemon.pokemon.locationExpires || moment().isAfter(pokemon.pokemon.locationExpires)) {
      // Find all locations that match the Pokemon's type (case-insensitive)
      const locations = await Locations.find({ type: pokemon.pokemon.type1 });

      // Check if the locations array is empty
      if (locations.length === 0) {
        console.warn(`No locations found for Pokemon type "${pokemon.pokemon.type1}" "${pokemon.pokemon.name}", setting to default location.`);
        pokemon.pokemon.currentLocation = 'Pokemon Labratory';
      } else {
        // Pick a random location from the list
        const randomIndex = Math.floor(Math.random() * locations.length);
        const randomLocation = locations[randomIndex];

        // Set the expiration time for the location
        const expirationTime = moment().add(Math.floor(Math.random() * 3) + 1, 'hours').toDate();

        // Update the location and expiration time in the Pokemon's document in the database
        const updatedPokemon = await PC.findOneAndUpdate({ _id: pokemon._id }, {
          'pokemon.currentLocation': randomLocation.name,
          'pokemon.locationExpires': expirationTime
        }, { upsert: true, new: true });

        // Log the change of location
        console.log(`Pokemon ${pokemon.pokemon.name} moved from ${pokemon.pokemon.currentLocation} to ${updatedPokemon.pokemon.currentLocation}`);
      }
    }
  }

  await mongoose.disconnect();
  console.log('Disconected from MongoDB successfully!')
}

// Connection URI
// const uri = `mongodb://${process.env.MONGODB_SERVER}/InteractionHistory`;

// // Connect to the MongoDB server
// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log("Connected to MongoDB");

//     // Get a reference to the chats collection
//     const Chat = mongoose.model("chats", {
//       userId: String,
//       timestamp: String,
//       content: String,
//       pokedexNumber: String
//     });

//     const startOfPreviousDay = new Date();
//     startOfPreviousDay.setDate(startOfPreviousDay.getDate() - 1);
//     startOfPreviousDay.setHours(0, 0, 0, 0);
//     const startOfPreviousDayISO = startOfPreviousDay.toISOString();

//     const endOfPreviousDay = new Date(startOfPreviousDay);
//     endOfPreviousDay.setHours(23, 59, 59, 999);
//     const endOfPreviousDayISO = endOfPreviousDay.toISOString();

//     // Query chats from the "chats" collection that match the filter
//     Chat.find({
//       userId: 'christopherjvance',
//       pokedexNumber: 5
//     })
//     .then(function(chats) {
//       console.log("Retrieved chats:");

//       // Log each chat
//       chats.forEach(function(chat) {
//         const chatDate = Date.parse(chat.timestamp);
//         console.log(chatDate)
//         if(chatDate >= Date.parse(startOfPreviousDayISO) && chatDate <= Date.parse(endOfPreviousDayISO)) {
//           console.log(chat);
//         }
//       });

//       // Close the MongoDB connection
//       mongoose.connection.close();
//     })
//     .catch(function(err) {
//       console.log("Error retrieving chats:", err);

//       // Close the MongoDB connection
//       mongoose.connection.close();
//     });
//   })
//   .catch((err) => {
//     console.log("Error connecting to MongoDB:", err);
//   });

module.exports = {
  updatePokemonLocations
};
