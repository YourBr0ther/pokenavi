const mongoose = require('mongoose');

const PokemonSchema = new mongoose.Schema({
  pokemon: {
    age: Number,
    type1: String,
    entries: [String],
    gender: String,
    hobby: String,
    name: String,
    nationalPokedexNumber: Number,
    species: String,
    traits: [String],
    isActive: Boolean,
    currentLocation: String,
    locationExpires: Date,
  },
  system: {
    current_topic: String,
    dreams: String,
    inner_dialogue: String,
    memory: String,
    previous_conversation_points: String,
    private_thoughts: String,
    response: String,
    rules: [String],
    topics_to_explore: String,
  },
  trainer: {
    UserId: String,
    age: Number,
    gender: String,
    name: String,
  }
}, {
  collection: 'Pokemons' // specify the custom collection name
});

// If it hasn't been defined yet, define the Pokemon model
const Pokemon = mongoose.models.Pokemon || mongoose.model('Pokemon', PokemonSchema);

module.exports = Pokemon;
