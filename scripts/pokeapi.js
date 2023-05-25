const axios = require('axios');

async function getPokemonEntries(species, count = 5) {
    try {
        species = species.replace(/ /g, "-");
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${species.toLowerCase()}`);
        const speciesData = response.data;
        const uniqueEntries = new Set();
        for (let entry of speciesData.flavor_text_entries) {
            const cleanedEntry = entry.flavor_text.replace(/\n|\f/g, ' ');
            uniqueEntries.add(cleanedEntry);
            if (uniqueEntries.size === count) {
                break;
            }
        }
        const entries = Array.from(uniqueEntries);
        const NationalPokedexNumber = speciesData.id;
        return { entries, NationalPokedexNumber };
    } catch (error) {
        console.error('Error fetching Pokémon entries:', error.message);
        return { entries: [], NationalPokedexNumber: null };
    }
}

async function getAllSpeciesNames() {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const speciesNames = response.data.results.map(pokemon => pokemon.name.replace(/-/g, ' ')).map(word => word.charAt(0).toUpperCase() + word.slice(1))
        return speciesNames;
    } catch (error) {
        console.error('Error retrieving Pokemon species data:', error.message);
        return null;
    }
}

async function getAllNatureNames() {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/nature');
        const natureNames = response.data.results.map(nature => nature.name.replace(/-/g, ' ')).map(word => word.charAt(0).toUpperCase() + word.slice(1));
        return natureNames;
    } catch (error) {
        console.error('Error retrieving Pokemon nature data:', error.message);
        return null;
    }
}

async function getPokemonTypes(pokemonName) {
    try {
        pokemonName = pokemonName.replace(/ /g, "-");
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
        const pokemonData = response.data;
        let type1 = null, type2 = null;

        if (pokemonData.types[0]) {
            type1 = pokemonData.types[0].type.name;
        }

        if (pokemonData.types[1]) {
            type2 = pokemonData.types[1].type.name;
        }

        console.log(type1)
        console.log(type2)
        return { type1, type2 };
    } catch (error) {
        console.error('Error retrieving Pokemon type data:', error.message);
        return { type1: null, type2: null };
    }
}

module.exports = {
    getPokemonEntries,
    getAllSpeciesNames,
    getAllNatureNames,
    getPokemonTypes
};
