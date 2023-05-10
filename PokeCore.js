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

    // Define the start and end of the day to retrieve logs for
    const startOfDay = new Date("2023-05-10T00:00:00.000Z");
    const endOfDay = new Date("2023-05-11T00:00:00.000Z");
    console.log("Start of day:", startOfDay);
    console.log("End of day:", endOfDay);

    // Define the Pokédex number to filter by
    const pokedexNumber = "5"; // Replace with the desired Pokédex number

    // Get a reference to the chats collection
    const Chat = mongoose.model("chats", {
      userId: String,
      timestamp: Date,
      content: String,
      pokedexNumber: String
    });

    // Retrieve logs for the specified day, and group them by user ID
    Chat.aggregate([
      {
        $match: {
          timestamp: {
            $gte: startOfDay,
            $lt: endOfDay
          }
        }
      },
      {
        $group: {
          _id: "$userId",
          logs: { $push: "$$ROOT" }
        }
      }
    ]).then(function(results) {
      console.log("Results:", results);
      // For each user, create a daily summary document
      results.forEach(function(userLogs) {
        const userId = userLogs._id;
        const summaryText = "Today's chat logs with User " + userId + " (Pokédex #" + pokedexNumber + "): ..."; // Replace with actual summary text

        const DailySummary = mongoose.model("Daily Summaries", {
          userId: String,
          date: Date,
          summary: String
        });

        const dailySummary = new DailySummary({
          userId: userId,
          date: startOfDay,
          summary: summaryText
        });

        // Insert the daily summary document into the daily_summaries collection
        dailySummary.save(function(err) {
          if (err) throw err;
          console.log("Inserted daily summary for user " + userId + " (Pokédex #" + pokedexNumber + ")");
        });
      });

      // Close the MongoDB connection
      mongoose.connection.close();
    })
    .catch(function(err) {
      console.log("Error retrieving chat logs:", err);
    });
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });
