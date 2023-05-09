const mongoose = require('mongoose');

async function saveMessagesToMongoDB(pokedexNumber) {

    try {

        const database = interactionHistoryConnection.client.db('InteractionHistory');
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

        const database = interactionHistoryConnection.client.db('InteractionHistory');
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

async function getAllPokemon() {
    let allPokemon = [];
    const userId = global.userId;

    try {
        await mongoose.connect(`mongodb://${process.env.MONGODB_SERVER}:27017/Pokemon`);
        const PokemonModel = mongoose.model(userId, PokemonSchema, userId);
        const pokemonDocs = await PokemonModel.find();
        allPokemon = pokemonDocs.map((doc) => ({
            species: doc.pokemon.species,
            pokedexNumber: doc.pokemon.nationalPokedexNumber,
        }));
    } catch (err) {
        console.error(err);
    }
    return allPokemon;
}

async function getPokemonByPokedexNumber(pokedexNumber) {
    const userId = global.userId;

    try {
        await mongoose.connect(`mongodb://${process.env.MONGODB_SERVER}:27017/Pokemon`);
        const PokemonModel = mongoose.model(userId, PokemonSchema, userId);
        const pokemonData = await PokemonModel.findOne({
            'pokemon.nationalPokedexNumber': Number(pokedexNumber),
        });

        if (pokemonData) {
            return pokemonData;
        } else {
            console.log(`Pokemon with Pokedex number ${pokedexNumber} not found`);
            return null;
        }
    } catch (error) {
        console.error(`Error getting Pokémon by Pokedex number:`, error);
        return null;
    }
}

module.exports = {
    saveMessagesToMongoDB,
    loadMessagesFromMongoDB,
    isMessageWithinDuration,
    getAllPokemon,
    getPokemonByPokedexNumber
  };