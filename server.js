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
// Message Logs for Each Pokemon
const runningMemoryLogs = {}
const interactionHistoryLogs = {}
// How long to keep the conversations
const conversationMemoryDuration = 7 * 24 * 60 * 60 * 1000

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
    console.log('getPokemon returning selectedPokemon')
    return selectedPokemon
}

// Pokemon JSON
let selectedPokemon

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

    // Load previous messages
    await loadMessagesFromCSV(selectedPokemon.NationalPokedexNumber);

    // Pull the string from the Pokemon JSON
    const pkmnSheet = selectedPokemon.PersonalitySheet

    runningMemoryLogs[selectedPokemon.NationalPokedexNumber].push({ role: "system", content: pkmnSheet, timestamp: new Date().toISOString() });

    // Create a temporary array called primeRunningMemory
    const primeRunningMemory = runningMemoryLogs[selectedPokemon.NationalPokedexNumber].slice();

    // Push the pkmnSheet to the primeRunningMemory array
    primeRunningMemory.push({
        role: "system",
        content: pkmnSheet,
        timestamp: new Date().toISOString(),
    });

    // Send pkmnSheet via the message array to ChatGPT and put response in response variable
    try {
         response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: primeRunningMemory.map(({ role, content }) => ({ role, content })), // Only send messages for this Pokemon
            temperature: 0.7,
            max_tokens: 1
        });
        console.log('Ready to receive requests')
    } catch (error) {
        console.error(error)
    }

}

// Send a message to the Pokemon with message array as well
async function sendChatToPokemon(prompt) {
    console.log('C: ' + prompt)

    // ChatGPT Response
    let response
    // Save prompt as user response to runningMemoryLogs and interactionHistoryLogs array
    runningMemoryLogs[selectedPokemon.NationalPokedexNumber].push({ role: "user", content: prompt, timestamp: new Date().toISOString() });
    interactionHistoryLogs[selectedPokemon.NationalPokedexNumber].push({ role: "user", content: prompt, timestamp: new Date().toISOString() });

    // Send user response with previous message array
    try {
        // Log the entire primeRunningMemory array
        console.log("primeRunningMemory:");
        runningMemoryLogs[selectedPokemon.NationalPokedexNumber].forEach((message, index) => {
            console.log(`Message ${index + 1}:`, message);
        });
        response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: runningMemoryLogs[selectedPokemon.NationalPokedexNumber].map(({ role, content }) => ({ role, content })), // Only send messages for this Pokemon
            temperature: 0.7,
            max_tokens: 100,
        });
    } catch (error) {
        console.error(error)
    }

    // Get just the string response
    const output_json = response.data.choices
    const output = output_json[0].message.content
    // Save ChatGPT's response to runningMemoryLogs and interactionHistoryLogs array
    runningMemoryLogs[selectedPokemon.NationalPokedexNumber].push({ role: "system", content: output, timestamp: new Date().toISOString() });
    interactionHistoryLogs[selectedPokemon.NationalPokedexNumber].push({ role: "system", content: output, timestamp: new Date().toISOString() });
    console.log('M ' + output)

    // Save messages to CSV
    saveMessagesToCSV(selectedPokemon.NationalPokedexNumber);

    // Add a delay of 200 milliseconds
    await new Promise(resolve => setTimeout(resolve, 200));

    return output
}

function saveMessagesToCSV(pokedexNumber) {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: `messages_${pokedexNumber}.csv`,
        header: [
            { id: 'role', title: 'Role' },
            { id: 'content', title: 'Content' },
            { id: 'timestamp', title: 'Timestamp' }
        ],
        append: true, // Add this line to append new messages to the existing ones
    });

    csvWriter.writeRecords(interactionHistoryLogs[pokedexNumber])
        .then(() => {
            console.log(`Messages saved to CSV file for Pokemon #${pokedexNumber}`);
        })
        .catch((error) => {
            console.error(`Error saving messages to CSV file for Pokemon #${pokedexNumber}:`, error);
        });
}

// Load messages from CSV file
async function loadMessagesFromCSV(pokedexNumber) {
    const csv = require('csv-parser');
    const results = [];

    try {
        const csvPath = path.join(directoryPath, `interaction_history_${pokedexNumber}.csv`);
        const csvExists = fs.existsSync(csvPath);

        if (csvExists) {
            const csvStream = fs.createReadStream(csvPath).pipe(csv({ headers: ['role', 'content', 'timestamp'] }));
            csvStream.on('data', (data) => results.push(data));
            csvStream.on('error', (error) => console.error(`Error loading interaction history for Pokemon #${pokedexNumber} from CSV file:`, error));
            await once(csvStream, 'end');
        }

        interactionHistoryLogs[pokedexNumber] = results.filter(isMessageWithinDuration);
        console.log(`Interaction history for Pokemon #${pokedexNumber} loaded from CSV file`);

        // Add interaction history to running memory
        runningMemoryLogs[pokedexNumber] = interactionHistoryLogs[pokedexNumber].slice();
    } catch (error) {
        console.error(`Error loading interaction history for Pokemon #${pokedexNumber} from CSV file:`, error);
    }
}

// Check if a message is within the specified duration
function isMessageWithinDuration(message) {
    const messageTimestamp = new Date(message.timestamp).getTime();
    const currentTimestamp = new Date().getTime();

    return currentTimestamp - messageTimestamp <= conversationMemoryDuration;
}

// Define the web app
const app = express()
// Use port 3000
const port = process.env.PORT || 3000;

// Use Body Parser for JSON requests
app.use(bodyParser.json());
// Use URL Encoded 
app.use(bodyParser.urlencoded({ extended: true }))
// Display the index.html page in the public folder
app.use(express.static("public"))

app.post('/prompt', async (req, res) => {
    const userMessage = req.body.userMessage

    try {
        // Get the Pokemon Response using our entered Prompt via the HTML form
        const response = await sendChatToPokemon(userMessage)
        // Send the Pokemon Response back to the HTML form
        res.json({ assistantResponse: response })
    } catch (error) {
        res.status(500).json({ error: "An error occurred while processing the request" })
    }
})

app.post('/switch', async (req, res) => {

    // Update the JSON Index for the next number
    JSONIndex = (JSONIndex + 1) % jsonFileNames.length;
    console.log('Switching to ' + jsonFileNames[JSONIndex]);

    // Clear previous messages
    messages = []

    // Update the chatbot with the next Pokemon
    try {
        // Import the JSON from the JSON files
        selectedPokemon = await getPokemon(JSONIndex)
        // Load previous conversations
        loadMessagesFromCSV(selectedPokemon.NationalPokedexNumber);
        // Prime the Chatbot again
        primeChatBot(selectedPokemon)
        res.json({
            assistantResponse: "Switched to new Pokemon!", // Modify this as per your requirement
            pokedexNumber: selectedPokemon.NationalPokedexNumber
        });

    } catch (error) {
        res.status(500).json({ error: "An error occurred while processing the request" })
    }

})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});