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
const fsPromises = require('fs').promises;
const { once } = require('events');

// Auth
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://192.168.0.4:27017/loginDemo', { useNewUrlParser: true, useUnifiedTopology: true });

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
let getPokemon = async () => {
    let testPath = `${directoryPath}/${jsonFileNames[0]}`
    let selectedPokemon
    const readFile = util.promisify(fs.readFile)
    try {
        const data = await readFile(testPath)
        // Import the actual JSON data and make it a variable
        selectedPokemon = JSON.parse(data)
        console.log('Successfully read and parsed JSON file:', selectedPokemon.system_species);
    } catch (err) {
        console.err('Error importing the JSON file: ' + err)
        process.exit(1)
    }
    return selectedPokemon
}
// Pokemon JSON
let selectedPokemon

// Import first JSON
(async () => {

    // Get the pokemon JSON via getPokemon
    selectedPokemon = await getPokemon();
    console.log('Name: ' + selectedPokemon.system_name);
    console.log('National Dex: ' + selectedPokemon.system_description.NationalPokedexNumber);

    // Prime the chat bot with the selected JSON
    primeChatBot(selectedPokemon)
})();

// Give the pkmnSheet to ChatGPT and get back first prompt
async function primeChatBot(selectedPokemon) {
    // ChatGPT Response
    let response;

    if (selectedPokemon) {
        console.log("Pokemon for priming: " + selectedPokemon.system_name);

        // Load previous messages
        await loadMessagesFromCSV(selectedPokemon.system_description.NationalPokedexNumber);

        // Pull the string from the Pokemon JSON
        const [pkmnSheet, string2] = createStringArrayFromJSON(selectedPokemon);

        // Declare the pokedexNumber to make it easier to call
        const pokedexNumber = selectedPokemon.system_description.NationalPokedexNumber;

        // If the runningMemoryLogs are empty, create them
        if (!runningMemoryLogs[pokedexNumber]) {
            runningMemoryLogs[pokedexNumber] = [];
        }

        // Update the runningMemoryLogs to include the role, the pkmnSheet, and the time/date
        runningMemoryLogs[pokedexNumber].push({
            role: "system",
            content: pkmnSheet,
            timestamp: new Date().toISOString(),
        });

        // Create a temporary array called primeRunningMemory
        const primeRunningMemory = runningMemoryLogs[pokedexNumber].slice();

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
                max_tokens: 1,
            });
            console.log("Ready to receive requests");
            return response;
        } catch (error) {
            console.error(error);
            process.exit(1)
        }
    } else {
        console.log("No selected pokemon");
        process.exit(1)
    }
}

// Load messages from CSV file
async function loadMessagesFromCSV(pokedexNumber) {
    const csv = require('csv-parser');
    const results = [];

    try {
        const csvPath = path.join(__dirname, `interaction_history_${pokedexNumber}.csv`);
        const csvExists = fs.existsSync(csvPath);

        if (csvExists) {
            const csvStream = fs.createReadStream(csvPath).pipe(csv({ headers: ['role', 'content', 'timestamp'] }));
            csvStream.on('data', (data) => results.push(data));
            csvStream.on('error', (error) => console.error(`Error loading interaction history for Pokemon #${pokedexNumber} from CSV file:`, error));
            console.log('Log found! Loading!')
            await once(csvStream, 'end');
        } else {
            console.log(`CSV file not found for Pokemon #${pokedexNumber}`);
        }

        // Double check to make sure the hstory is withi nthe time limit
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

// Function to create a two string array from a JSON file
function createStringArrayFromJSON(json) {
    const string1 = [
        json.rules.join(', '),
        json.user_name,
        json.user_gender,
        json.system_interest,
        json.system_description.entries.join(', '),
        json.system_age,
        json.system_personality,
        json.system_species,
        json.system_name,
        json.system_gender
    ].join('');

    const string2 = [
        json.system_description.NationalPokedexNumber.toString()
    ];

    // Return the pkmnSheet string and the NatonalPokedex number
    return [string1, string2];
}

// Send a message to the Pokemon with message array as well
async function sendChatToPokemon(prompt) {
    try {
        const pokedexNumber = global.selectedPokemon.system_description.NationalPokedexNumber
        const trainerName = global.selectedPokemon.user_name
        console.log(trainerName + ': ' + prompt)

        // ChatGPT Response
        let response

        // Save prompt as user response to runningMemoryLogs and interactionHistoryLogs array
        runningMemoryLogs[pokedexNumber].push({ role: "user", content: prompt, timestamp: new Date().toISOString() });
        interactionHistoryLogs[pokedexNumber].push({ role: "user", content: prompt, timestamp: new Date().toISOString() });

        // Send user response with previous message array
        try {
            // Log the entire primeRunningMemory array
            runningMemoryLogs[pokedexNumber].forEach((message, index) => {
            });
            // Get ChatGPT's response
            response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: runningMemoryLogs[pokedexNumber].map(({ role, content }) => ({ role, content })), // Only send messages for this Pokemon
                temperature: 0.7,
                max_tokens: 100,
            });
        } catch (error) {
            console.log("Failing")
            console.error(error)
            process.exit(1)
        }

        // Get just the string response
        const output_json = response.data.choices
        const output = output_json[0].message.content
        // Save ChatGPT's response to runningMemoryLogs and interactionHistoryLogs array
        runningMemoryLogs[pokedexNumber].push({ role: "system", content: output, timestamp: new Date().toISOString() });
        interactionHistoryLogs[pokedexNumber].push({ role: "system", content: output, timestamp: new Date().toISOString() });
        const pokemonName = global.selectedPokemon.system_name
        console.log(pokemonName + ': ' + output)

        // Save messages to CSV
        saveMessagesToCSV(pokedexNumber);

        // Add a delay of 200 milliseconds
        await new Promise(resolve => setTimeout(resolve, 200));

        // Return OpenAI's response
        return output

    } catch (error) {
        console.error("Error in sendChatToPokemon:", error);
    }
}

// Save the last two lines from the Interacton History logs to a CSV
function saveMessagesToCSV(pokedexNumber) {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: `interaction_history_${pokedexNumber}.csv`,
        header: [
            { id: 'role', title: 'Role' },
            { id: 'content', title: 'Content' },
            { id: 'timestamp', title: 'Timestamp' }
        ],
        append: true, // Add this line to append new messages to the existing ones
    });

    const lastTwoMessages = interactionHistoryLogs[pokedexNumber].slice(-2);

    csvWriter.writeRecords(lastTwoMessages)
        .then(() => {
            console.log(`Messages saved to CSV file for Pokemon #${pokedexNumber}`);
        })
        .catch((error) => {
            console.error(`Error saving messages to CSV file for Pokemon #${pokedexNumber}:`, error);
            process.exit(1)
        });
}

// Function to read all JSON files and extract Pokemon names and Pokedex numbers
async function getAllPokemon() {
    let allPokemon = [];
    for (const file of jsonFileNames) {
        const filePath = `${directoryPath}/${file}`;
        const data = await fs.promises.readFile(filePath);
        const pokemon = JSON.parse(data);
        allPokemon.push({
            species: pokemon.system_species,
            pokedexNumber: pokemon.system_description.NationalPokedexNumber,
        });
    }
    return allPokemon;
}

// Get a Pokemon JSON by its PokedexNumber instead of its JSON Index
async function getPokemonByPokedexNumber(pokedexNumber) {
    try {
        // for each of the JSON files, look to see if the seleted pokedmon's natonal dex number matches te PokedexNumber
        for (const fileName of jsonFileNames) {
            const fileData = await fsPromises.readFile(`./JSON/${fileName}`, 'utf8');
            const pokemonData = JSON.parse(fileData);
            if (pokemonData.system_description.NationalPokedexNumber == pokedexNumber) {
                console.log(`Found ${pokemonData.system_species}`);
                return pokemonData;
            }
        }

        console.log(`Pokemon not found`);
        return null;
    } catch (error) {
        console.error(`Error getting Pokémon by Pokedex number:`, error);
        return null;
    }
}

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Define the web app
const app = express()
const port = process.env.PORT || 3000;
const User = require('./models/User');

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/login', (req, res) => {
    res.render('login');
});

// Set up session middleware
app.use(session({
    secret: `process.env.MONGODB_SECRET`,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb://192.168.0.4:27017/loginDemo' }),
}));

// Handle login form submission
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
        console.log('Authed')
        req.session.user = { id: user._id, username: user.username };
        res.redirect('/');
    } else {
        console.log('Not Authed')
        res.redirect('/login');
    }
});

app.get('/', isAuthenticated, async (req, res) => {
    try {
        const allPokemon = await getAllPokemon();
        res.render('index', { user: req.session.user, allPokemon });
    } catch (error) {
        res.status(500).send('An error occurred while fetching the Pokémon list');
    }
});

// Render registration page
app.get('/register', (req, res) => {
    res.render('register');
});

// Handle registration form submission
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    await user.save();
    res.redirect('/login');
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.post('/prompt', isAuthenticated, async (req, res) => {
    const userMessage = req.body.userMessage;

    try {
        // Get the Pokemon Response using our entered Prompt via the HTML form
        const response = await sendChatToPokemon(userMessage);

        // Send the Pokemon Response back to the HTML form
        res.json({ assistantResponse: `Pokemon: ${response}` });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while processing the request" });
    }
});

app.post('/switch', isAuthenticated, async (req, res) => {
    const pokedexNumber = req.body.pokedexNumber;
    console.log('Species Received: ' + pokedexNumber)
    try {
        // Find the Pokémon by species name
        const selectedPokemon = await getPokemonByPokedexNumber(pokedexNumber);
        global.selectedPokemon = selectedPokemon
        if (!selectedPokemon) {
            res.status(404).json({ error: "Pokémon not found" });
            return;
        }

        // Load previous conversations
        loadMessagesFromCSV(selectedPokemon.system_description.NationalPokedexNumber);

        // Prime the Chatbot again
        primeChatBot(selectedPokemon);

        res.json({
            assistantResponse: "Switched to new Pokémon!",
            pokedexNumber: selectedPokemon.system_description.NationalPokedexNumber
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "An error occurred while processing the request" });
        process.exit(1)
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});