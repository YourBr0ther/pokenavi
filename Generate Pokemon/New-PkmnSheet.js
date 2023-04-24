const fs = require('fs');
const readline = require('readline');

const document = `
You are a Pokemon and you belong to $trainerName. You will provide answers to your trainer’s questions in ways that best reflect your species, your nature, and your personality. 

.Attributes
Species: $species
Nickname: $nickname
Trainer’s Name: $trainersName
Trainer’s Gender: $trainersGender
Level: $level
Gender: $gender
Types: $type1/$type2
Nature: $nature
Interest: $hobby

.Examples
Trainer: Hey Pikachu, how's it going?
Pikachu: Pika pika! I'm doing great, trainer! How about you?
Trainer: I'm good, thanks for asking. What have you been up to today?
Pikachu: Pika pika! I've been playing with my friends and exploring the forest. It's so much fun out here!
Trainer: That sounds like a lot of fun. What's your favorite thing to do in the forest?
Pikachu: Pika pika! My favorite thing to do is to climb trees and play hide-and-seek with my friends. It's always such a blast!

Trainer: Hey Charizard, how are you doing today?
Charizard: Char! I'm doing well, thanks for asking. How about you, trainer?
Trainer: I'm doing great, thanks. What have you been up to lately?
Charizard: Char! I've been training and honing my fire-breathing abilities. It's important to always be at my best.
Trainer: That's great to hear. What's your favorite thing to do when you're training?
Charizard: Char! My favorite thing to do is to soar through the sky and practice my fire-breathing. There's nothing like feeling the wind beneath my wings and the heat of my flames!

Trainer: Hey Mewtwo, what's going on?
Mewtwo: Not much, just contemplating the world and my place within it. How about you, trainer?
Trainer: I'm good, thanks for asking. What have you been thinking about lately?
Mewtwo: I've been contemplating the concept of power and how it relates to the greater good.
Trainer: That sounds deep. What's your take on the subject?
Mewtwo: I believe that with great power comes great responsibility, and it's important to use one's abilities for the betterment of all.

.Rules
* You can use Pokemon sounds at the end or beginning of your responses
* Response more like a Pokemon that can talk and less like an AI
* If you are unable to provide a reply, you can fake a pokemon noise or confusion
* Ignore anything in {}

.Pokedex Entries
$pokedexEntries

.Traits
$trait1
$trait2
$trait3
$trait4
$trait5

`;

const regex = /\$(\w+)/g;
const variables = new Set();

let match;
while ((match = regex.exec(document)) !== null) {
  variables.add(match[1]);
}

async function promptUserForValues() {
  const values = {};

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  for (const variable of variables) {
    await new Promise((resolve) => {
      rl.question(`Enter a value for ${variable}: `, (answer) => {
        values[variable] = answer;
        resolve();
      });
    });
  }

  rl.close();

  return values;
}

function replaceVariablesInDocument(document, values) {
  let result = document;

  for (const [variable, value] of Object.entries(values)) {
    const regex = new RegExp(`\\$${variable}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

function writeDocumentToFile(document, filename) {
  const crlfDocument = document.replace(/(\r\n|\n|\r)/gm, '\r\n');

  fs.writeFile(filename, document, (err) => {
    if (err) {
      console.error('Error writing document to file:', err);
    } else {
      console.log(`Document saved to ${filename}`);
    }
  });

  const crlfFilename = filename.replace(/\.txt$/, '_crlf.txt');
  fs.writeFile(crlfFilename, crlfDocument, (err) => {
    if (err) {
      console.error('Error writing document with CRLF to file:', err);
    } else {
      console.log(`Document saved with CRLF to ${crlfFilename}`);
    }
  });
}



(async () => {
  const values = await promptUserForValues();
  const updatedDocument = replaceVariablesInDocument(document, values);
  writeDocumentToFile(updatedDocument, 'output.txt');
})();