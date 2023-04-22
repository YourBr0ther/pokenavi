/*
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
console.log('')

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

// Pokemon JSON
let selectedPokemon
// Chat messages
let messages = [];

// Import first JSON
(async () => {
    selectedPokemon = await getPokemon(JSONIndex);
    console.log('Name: ' + selectedPokemon.Nickname);
    console.log('National Dex: ' + selectedPokemon.NationalPokedexNumber);
    primeChatBot(selectedPokemon)

})();

// Give the pkmnSheet to ChatGPT and get back first prompt
async function primeChatBot(selectedPokemon) {

    // ChatGPT Response
    let response
    console.log('Pokemon for priming: ' + selectedPokemon.Nickname)
    console.log('')

    // Pull the string from the Pokemon JSON
    const pkmnSheet = selectedPokemon.PersonalitySheet

    // Push the pkmnSheet to the message array
    messages.push({ role: "system", content: pkmnSheet })

    // Send pkmnSheet via the message array to ChatGPT and put response in response variable
    try {
        response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
        });
    } catch (error) {
        console.error(error)
    }

    // Get just the string response
    const output_json = response.data.choices
    const output = output_json[0].message.content
    console.log('M: ' + output)
    console.log('')

    // Ask random questions 
    await sendChatToPokemon("Chris's favorite color is Green")
    console.log('')
    await sendChatToPokemon("What are you going to get into today?")
    console.log('')
    await sendChatToPokemon("What is Chris's favorite color?")
    console.log('')

    // Save messages to CSV file
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: 'messages.csv',
        header: [
            { id: 'role', title: 'Role' },
            { id: 'content', title: 'Content' }
        ]
    });

    csvWriter.writeRecords(messages)
        .then(() => console.log('Messages saved to CSV file'))
        .catch((error) => console.error('Error saving messages to CSV file:', error));
}

// Send a message to the Pokemon with message array as well
async function sendChatToPokemon(prompt) {
    console.log('C: ' + prompt)

    // ChatGPT Response
    let response
    // Save prompt as user response to messages array
    messages.push({ role: "user", content: prompt })

    // Send user response with previous message array
    try {
        response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 100
        });
    } catch (error) {
        console.error(error)
    }

    // Get just the string response
    const output_json = response.data.choices
    const output = output_json[0].message.content
    // Save ChatGPT's response to message array
    messages.push({ role: "system", content: output })
    console.log('M ' + output)

}
