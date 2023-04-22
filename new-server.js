// Clear the console
console.clear()

//  * Packages 
// Env module
require('dotenv').config
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

// * Constant Variables
// JSON directory
const directoryPath = path.join(__dirname, './JSON/');
console.log('JSON Files: ' + directoryPath)
// JSON Files
const jsonFileNames = fs.readdirSync(directoryPath).filter(file => path.extname(file) === '.json');
console.log('JSON Files: ' + jsonFileNames)

// Import first JSON
let JSONIndex = 0
let activePokemon = async (JSONIndex) => {
    let testPath = `${directoryPath}/${jsonFileNames[JSONIndex]}`
    let selectedJSON
    fs.readFile(testPath, (err, data) => {
        if (err) {
            console.log(err)
            return
        }
    
        try {
            selectedJSON = JSON.parse(data)
            console.log(activeJSON)
        } catch (err) {
            console.error(err)
            return
        }
    })


    return selectedJSON
}
// Import first JSON

(async () => {
    const selectedJSON = await activePokemon(JSONIndex);
    console.log(selectedJSON);
})();


// * Dynamic Variables
// Short-term Memory
let messages = [];

let activeJSON