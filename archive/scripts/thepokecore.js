console.clear()
require('dotenv').config();
const mongoose = require('mongoose');
const moment = require('moment');
const Locations = require('../models/Location.js');

const connectToDatabase = async () => {
    try {
        await mongoose.connect(`mongodb://${process.env.MONGODB_SERVER}/Pokemon`);
        console.log('Connected to MongoDB successfully!');
        return true;
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        return false;
    }
};

// Function to pick a random location for a given Pokemon type
async function updatePokemonLocations() {
    const isConnected = await connectToDatabase();
    if (!isConnected) {
        console.log('Database connection failed. Please try again.');
        return;
    }
    
    const PCSchema = new mongoose.Schema({
        'pokemon.name': String,
        'pokemon.type1': String,
        'pokemon.currentLocation': { type: String, default: null },
        'pokemon.locationExpires': { type: Date, default: null }
    }, {
        collection: 'PC' // specify the custom collection name
    });

    const PC = mongoose.models.PC || mongoose.model('PC', PCSchema);

    const pokemons = await PC.find();
    // Rest of the code is the same

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB successfully!')
}

module.exports = {
    updatePokemonLocations
};

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
