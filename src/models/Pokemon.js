const mongoose = require('mongoose');
const { Schema } = mongoose.Schema;

const pokemonSchema = new Schema({
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
        UserId: String
    }
});

export default mongoose.model("Pokemon", pokemonSchema)