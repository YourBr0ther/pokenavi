require('dotenv').config();
const mongoose = require('mongoose');
const uriLoginDemo = `mongodb://${process.env.MONGODB_SERVER}/loginDemo`;
const uriInteractionHistory = `mongodb://${process.env.MONGODB_SERVER}/InteractionHistory`;
const uriPokemonList = `mongodb://${process.env.MONGODB_SERVER}/Pokemon`;
const LoginDemoConnection = mongoose.createConnection(uriLoginDemo, { useNewUrlParser: true, useUnifiedTopology: true });
LoginDemoConnection.on('connected', () => {
  console.log('Connected to LoginDemo DB');
});
LoginDemoConnection.on('error', console.error.bind(console, 'LoginDemoConnection error:'));
LoginDemoConnection.on('disconnected', () => {
  console.log('LoginDemoConnection disconnected');
});

const InteractionHistoryConnection = mongoose.createConnection(uriInteractionHistory, { useNewUrlParser: true, useUnifiedTopology: true });
InteractionHistoryConnection.on('connected', () => {
  console.log('Connected to InteractionHistory DB');
});
InteractionHistoryConnection.on('error', console.error.bind(console, 'InteractionHistoryConnection error:'));
InteractionHistoryConnection.on('disconnected', () => {
  console.log('InteractionHistoryConnection disconnected');
});

const PokemonListConnection = mongoose.createConnection(uriPokemonList, { useNewUrlParser: true, useUnifiedTopology: true });
PokemonListConnection.on('connected', () => {
  console.log('Connected to PokemonList DB');
});
PokemonListConnection.on('error', console.error.bind(console, 'PokemonListConnection error:'));
PokemonListConnection.on('disconnected', () => {
  console.log('PokemonListConnection disconnected');
});

const createUserModel = require('../models/User.js');
const User = createUserModel(LoginDemoConnection);
let runningMemoryLogs = {}
let interactionHistoryLogs = {}
const conversationMemoryDuration = 7 * 24 * 60 * 60 * 1000
const PokemonSchema = new mongoose.Schema({
    pokemon: {
        species: { type: String, required: true },
        nationalPokedexNumber: { type: Number, required: true },
        isActive: { type: Boolean, default: false }
    },
    trainer: {
        UserId: { type: String, required: true },
    }
});

async function saveMessagesToMongoDB(pokedexNumber) {
    if (!InteractionHistoryConnection.readyState) {
        console.error('Database not connected yet');
        return;
    }
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
    if (!InteractionHistoryConnection.readyState) {
        console.error('Database not connected yet');
        return;
    }
    try {
        const database = InteractionHistoryConnection.client.db('InteractionHistory');
        const collection = database.collection('chats');
        const userId = global.userId;
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
    if (!PokemonListConnection.readyState) {
        console.error('Database not connected yet');
        return;
    }
    let allPokemon = [];
    const userId = global.userId;
    try {
        const PokemonModel = PokemonListConnection.model('PC', PokemonSchema, 'PC');

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

async function getActivePokemon() {
    if (!PokemonListConnection.readyState) {
        console.error('Database not connected yet');
        return;
    }
    let activePokemon = [];
    const userId = global.userId;
    try {
        const PokemonModel = PokemonListConnection.model('PC', PokemonSchema, 'PC');

        const pokemonDocs = await PokemonModel.find({
            'trainer.UserId': userId,
            'pokemon.isActive': true
        });

        activePokemon = pokemonDocs.map((doc) => ({
            species: doc.pokemon.species,
            pokedexNumber: doc.pokemon.nationalPokedexNumber,
        }));
        return activePokemon;

    } catch (err) {
        console.error(err);
        return null;
    }
}

async function updateActivePokemon(pokedexNumbers, userId) {
    if (!PokemonListConnection.readyState) {
        console.error('Database not connected yet');
        return;
    }
    try {
        const PokemonModel = PokemonListConnection.model('PC', PokemonSchema, 'PC');

        // First, set all Pokemon for the user to inactive
        await PokemonModel.updateMany({ 'trainer.UserId': userId }, { 'pokemon.isActive': false });

        // Then, set the specified Pokemon to active
        for (let pokedexNumber of pokedexNumbers) {
            await PokemonModel.updateOne({ 'pokemon.nationalPokedexNumber': pokedexNumber, 'trainer.UserId': userId }, { 'pokemon.isActive': true });
        }

        console.log(`Successfully updated active Pokemon for user ${userId}`);
    } catch (err) {
        console.error(`Error updating active Pokemon for user ${userId}:`, err);
    }
}

module.exports = {
    saveMessagesToMongoDB,
    loadMessagesFromMongoDB,
    getAllPokemon,
    updateActivePokemon,
    getActivePokemon,
    User,
    runningMemoryLogs,
    interactionHistoryLogs,
    LoginDemoConnection,
    PokemonListConnection
  };
