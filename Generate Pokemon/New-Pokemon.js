// Modules
const readline = require('readline');
const fs = require('fs');

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

    const entries = speciesData.flavor_text_entries
      .slice(0, count)
      .map((entry) => removeNewlines(entry.flavor_text));

    return entries;
  } catch (error) {
    console.error('Error fetching Pokémon entries:', error.message);
    return [];
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

  answerArray.system_description = await getPokemonEntries(answerArray.system_species);

  rl.close();

  // Call createPokemon and writeFile after user input is collected
  const pokemon = createPokemon(template, answerArray);

  // Write the pokemon object to a JSON file
  fs.writeFile('pokemon.json', JSON.stringify(pokemon), (err) => {
    if (err) throw err;
    console.log('Pokemon saved!');
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
  user_name: "<$user_name>",
  user_gender: "<$user_gender>",
  system_interest: "<$system_interest>",
  system_description: ["<$system_description[0]>", "<$system_description[1]>", "<$system_description[2]>", "<$system_description[3]>", "<$system_description[4]>"],
  system_age: "<$system_age>",
  system_personality: "<$system_personality>",
  system_species: "<$system_species>",
  system_name: "<$system_name>",
  system_gender: "<$system_gender>"
};

function createPokemon(template, answerArray) {
  const myPokemon = {};

  for (const key in template) {
    if (template.hasOwnProperty(key)) {
      if (key === 'system_description') {
        myPokemon[key] = answerArray[key];
      } else if (typeof template[key] === 'string') {
        myPokemon[key] = template[key].replace(/<\$([a-zA-Z0-9_]+)>/g, (_, matchedKey) => answerArray[matchedKey]);
      } else {
        myPokemon[key] = template[key];
      }
    }
  }

  return myPokemon;
}