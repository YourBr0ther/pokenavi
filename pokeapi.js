const fetch = require('fetch')
const axios = require('axios');

async function getPokemonEntries(species, count = 5) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${species.toLowerCase()}`);
        const speciesData = await response.json();
        const entries = speciesData.flavor_text_entries.slice(0, count).map((entry) => entry.flavor_text.replace(/\n|\f/g, ' '));
        const NationalPokedexNumber = speciesData.id;

        return { entries, NationalPokedexNumber };
    } catch (error) {
        console.error('Error fetching Pokémon entries:', error.message);
        return { entries: [], NationalPokedexNumber: null };
    }
}

// Function to retrieve all Pokemon species names
async function getAllSpeciesNames() {
    try {
        const response = await get('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const speciesNames = response.data.results.map(pokemon => pokemon.name.replace(/-/g, ' ')).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        return speciesNames;
    } catch (error) {
        console.error('Error retrieving Pokemon species data:', error.message);
        return null;
    }
}

// Function to retrieve all nature names
async function getAllNatureNames() {
    try {
        const response = await get('https://pokeapi.co/api/v2/nature');
        const natureNames = response.data.results.map(nature => nature.name.replace(/-/g, ' ')).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        return natureNames;
    } catch (error) {
        console.error('Error retrieving Pokemon nature data:', error.message);
        return null;
    }
}


module.exports = {
    getPokemonEntries,
    getAllSpeciesNames,
    getAllNatureNames
};
