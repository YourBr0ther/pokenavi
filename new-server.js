/*

Start program
Load the first JSON file
Feed the selected JSON file to OpenAI to prime the chatbot
Put the response into index 0 of the message array

WAIT

User inputs first request.
The request is passed to the OpenAI with the message array and saved to the message array
The chatbot returns the response and saved to the message array

Import Values
 * JSON Index
 * Messages
 * JSON Personality Sheet
 * Species Number








Button press

Switch
The switch button will cause the selected JSON to be changed out for the next one in the JSON directory.
The new JSON file will be sent to OpenAI to prim the chatbot again
The message array will be purge









*/

// Clear the console
console.clear()

//  * Packages 
// ENV module
require('dotenv').config();
// OpenAI modules
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
// Express modules
const express = require("express");
const bodyParser = require("body-parser");
// File System modules
const fs = require('fs');
const path = require('path');
const util = require("util");
const { domainToASCII } = require('url');

// * Constant Variables
// JSON directory
const directoryPath = path.join(__dirname, './JSON/');
console.log('JSON Directory: ' + directoryPath)
// JSON Files
const jsonFileNames = fs.readdirSync(directoryPath).filter(file => path.extname(file) === '.json');
console.log('JSON Files: ' + jsonFileNames)

// Import first JSON
let JSONIndex = 0
let getPokemon = async (JSONIndex) => {
    let testPath = `${directoryPath}/${jsonFileNames[JSONIndex]}`
    let selectedPokemon
    const readFile = util.promisify(fs.readFile)
    try {
        const data = await readFile(testPath)
        selectedPokemon = JSON.parse(data)
    } catch (err) {
        console.err('Error importing the JSON file: ' + err)
    }

    return selectedPokemon
}

let selectedPokemon
let messages = [];
//let activeJSON

// Import first JSON
(async () => {
    selectedPokemon = await getPokemon(JSONIndex);
    console.log('Name: ' + selectedPokemon.Nickname);
    console.log('National Dex: ' + selectedPokemon.NationalPokedexNumber);
    primeChatBot(selectedPokemon)
})();

async function primeChatBot(selectedPokemon) {
    let response
    console.log('Pokemon for priming: ' + selectedPokemon.Nickname)
    const pkmnSheet = selectedPokemon.PersonalitySheet
    messages.push({ role: "system", content: pkmnSheet })

    try {
        response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7
        });
    } catch (error) {
        console.error(error)
    }
    console.log(response)
}

// * Dynamic Variables
// Short-term Memory


