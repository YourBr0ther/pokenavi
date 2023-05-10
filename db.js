require('dotenv').config();
const mongoose = require('mongoose');
const uriLoginDemo = `mongodb://${process.env.MONGODB_SERVER}/loginDemo`;
const uriInteractionHistory = `mongodb://${process.env.MONGODB_SERVER}/InteractionHistory`;
const uriPokemonList = `mongodb://${process.env.MONGODB_SERVER}/Pokemon`;
const LoginDemoConnection = mongoose.createConnection(uriLoginDemo, { useNewUrlParser: true, useUnifiedTopology: true });
const InteractionHistoryConnection = mongoose.createConnection(uriInteractionHistory, { useNewUrlParser: true, useUnifiedTopology: true });
const PokemonListConnection = mongoose.createConnection(uriPokemonList, { useNewUrlParser: true, useUnifiedTopology: true });
const createUserModel = require('./models/User');
const User = createUserModel(LoginDemoConnection);
const runningMemoryLogs = {}
const interactionHistoryLogs = {}
const conversationMemoryDuration = 7 * 24 * 60 * 60 * 1000
const PokemonSchema = new mongoose.Schema({
    pokemon: {
        species: { type: String, required: true },
        nationalPokedexNumber: { type: Number, required: true },
    },
});

async function saveMessagesToMongoDB(pokedexNumber) {

    try {

        const database = InteractionHistoryConnection.client.db('InteractionHistory');
        const collection = database.collection('chats');
        let lastTwoMessages = interactionHistoryLogs[pokedexNumber].slice(-2);
        lastTwoMessages.forEach(message => {
            message.userId = global.userId;
            message.pokedexNumber = pokedexNumber;
        });

        if (lastTwoMessages.length > 0) {
            await collection.insertMany(lastTwoMessages);
        } else {
            console.log('No messages to save to MongoDB');
        }
    } catch (error) {
        console.error(`Error saving messages to MongoDB for Pokemon #${pokedexNumber} and user ${global.userId}:`, error);
    }
}

async function loadMessagesFromMongoDB(pokedexNumber, tokenLimit) {
    try {

        const database = InteractionHistoryConnection.client.db('InteractionHistory');
        const collection = database.collection('chats');
        const userId = global.userId
        const cursor = collection.find({ 'pokedexNumber': pokedexNumber, 'userId': userId }).sort({ _id: -1 });

        const results = await cursor.toArray();
        let tokenCount = 0;
        const filteredResults = results.filter((message) => {
            const messageTokenCount = message.text ? message.text.length : 0;
            tokenCount += messageTokenCount;
            return tokenCount <= tokenLimit;
        });

        interactionHistoryLogs[pokedexNumber] = filteredResults.filter(isMessageWithinDuration);
        runningMemoryLogs[pokedexNumber] = interactionHistoryLogs[pokedexNumber].slice();
    } catch (error) {
        console.error(`Error loading interaction history for Pokemon #${pokedexNumber} and user ${userId} from MongoDB:`, error);
    }
}

function isMessageWithinDuration(message) {
    const messageTimestamp = new Date(message.timestamp).getTime();
    const currentTimestamp = new Date().getTime();

    return currentTimestamp - messageTimestamp <= conversationMemoryDuration;
}

async function getAllPokemon(pokedexNumber) {
    let allPokemon = [];
    const userId = global.userId;

    try {
        await mongoose.connect(`mongodb://${process.env.MONGODB_SERVER}:27017/Pokemon`);
        const PokemonModel = mongoose.model('PC', PokemonSchema, 'PC');

        if (pokedexNumber) {
            const pokemonData = await PokemonModel.findOne({
                'pokemon.nationalPokedexNumber': Number(pokedexNumber),
                'trainer.UserId': userId
            });

            if (pokemonData) {
                return pokemonData;
            } else {
                console.log(`Pokemon with Pokedex number ${pokedexNumber} not found`);
                return null;
            }
        } else {
            const pokemonDocs = await PokemonModel.find({
                'trainer.UserId': userId
            });
            allPokemon = pokemonDocs.map((doc) => ({
                species: doc.pokemon.species,
                pokedexNumber: doc.pokemon.nationalPokedexNumber,
            }));
            return allPokemon;
        }

    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = {
    saveMessagesToMongoDB,
    loadMessagesFromMongoDB,
    isMessageWithinDuration,
    getAllPokemon,
    User,
    runningMemoryLogs,
    interactionHistoryLogs,
    LoginDemoConnection,
    PokemonListConnection
  };