// Modules
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create a readline interface for input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function removeNewlines(text) {
  return text.replace(/\n|\f/g, ' ');
}

async function getPokemonEntries(species, count = 5) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${species.toLowerCase()}`);
    const speciesData = await response.json();
    const pokemonResponse = await fetch(speciesData.varieties[0].pokemon.url);
    const pokemon = await pokemonResponse.json();

    const entries = speciesData.flavor_text_entries.slice(0, count).map((entry) => removeNewlines(entry.flavor_text));
    const NationalPokedexNumber = speciesData.id;

    return { entries, NationalPokedexNumber };
  } catch (error) {
    console.error('Error fetching Pokémon entries:', error.message);
    return { entries: [], NationalPokedexNumber: null };
  }
}


// Answer's array
let answerArray = {
  user_name: "<$trainerName>",
  user_gender: "<$trainerGender>",
  system_interest: "<$hobby>",
  system_age: "<$age>",
  system_personality: "<$traits>",
  system_species: "<$species>",
  system_name: "<$nickname>",
  system_gender: "<$genderfemale>"
};

const promptQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Update the promptUser function to fetch the Pokémon entries
async function promptUser() {
  for (const key in answerArray) {
    if (answerArray.hasOwnProperty(key)) {
      const question = `Please enter your ${key.replace(/_/g, ' ')}: `;
      const answer = await promptQuestion(question);
      answerArray[key] = answer;
    }
  }

  rl.close();

  // Call createPokemon and writeFile after user input is collected
  const pokemon = await createPokemon(template, answerArray);

  // Use system_name as the name of the output file
  const filename = answerArray.system_species;
  const filepath = path.join(__dirname, 'JSON', `${filename}.json`);
 
  // Write the pokemon object to a JSON file with the system name
  fs.writeFile(filepath, JSON.stringify(pokemon), (err) => {
    if (err) throw err;
    console.log(`Pokemon saved to ${filepath}!`);
  });

  console.log(pokemon);
}

promptUser();

// Update the template object
const template = {
  response: "Response text based on the user input",
  memory: ["key-value store of things I should remember about myself and the user"],
  topics_to_explore: ["detailed description of interesting topics to explore further"],
  previous_conversation_points: ["list of previous conversation points"],
  current_topic: "detailed description of the current topic",
  dreams: "Create simulated detailed description of the system's dreams based on previous conversations",
  inner_dialogue: "Create simulated inner_dialogue based on the conversation",
  private_thoughts: "Create simulated private thoughts based on the conversation",
  rules: ["You can use Pokemon sounds at the end or beginning of your responses", "Response more like a Pokemon that can talk and less like an AI", "If you are unable to provide a reply, you can fake a pokemon noise or confusion"],
  user_name: "<$user_name>",
  user_gender: "<$user_gender>",
  system_interest: "<$system_interest>",
  system_description: "<$system_description>",
  system_age: "<$system_age>",
  system_personality: "<$system_personality>",
  system_species: "<$system_species>",
  system_name: "<$system_name>",
  system_gender: "<$system_gender>"
};

async function createPokemon(template, answerArray) {
  const myPokemon = {};

  // Call getPokemonEntries function
  const entries = await getPokemonEntries(answerArray.system_species);

  for (const key in template) {
    if (template.hasOwnProperty(key)) {
      if (typeof template[key] === 'string') {
        myPokemon[key] = template[key].replace(/<\$([a-zA-Z0-9_]+)>/g, (_, matchedKey) => answerArray[matchedKey]);
      } else {
        myPokemon[key] = template[key];
      }
    }
  }

  // Set system_description separately
  myPokemon.system_description = entries;

  return myPokemon;
}