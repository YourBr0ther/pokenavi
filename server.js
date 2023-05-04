console.clear()
require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;
const axios = require('axios');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const uri = `mongodb://${process.env.MONGODB_SERVER}/InteractionHistory`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(`mongodb://${process.env.MONGODB_SERVER}/loginDemo`, { useNewUrlParser: true, useUnifiedTopology: true });
const directoryPath = path.join(__dirname, './JSON/');
const jsonFileNames = fs.readdirSync(directoryPath).filter(file => path.extname(file) === '.json');
const runningMemoryLogs = {}
const interactionHistoryLogs = {}
const conversationMemoryDuration = 7 * 24 * 60 * 60 * 1000
let userId

async function primeChatBot(selectedPokemon) {
    let response;

    if (selectedPokemon) {
        console.log("Pokemon for priming: " + selectedPokemon.pokemon.name);

        const pokedexNumber = selectedPokemon.pokemon.nationalPokedexNumber;
        await loadMessagesFromMongoDB(pokedexNumber, userId)

        const [pkmnSheet, string2] = createStringArrayFromJSON(selectedPokemon);

        if (!runningMemoryLogs[pokedexNumber]) {
            runningMemoryLogs[pokedexNumber] = [];
        }

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
                model: "gpt-4",
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

async function saveMessagesToMongoDB(pokedexNumber) {
    const localClient = new MongoClient(uri);

    try {

        await localClient.connect();

        const database = localClient.db('InteractionHistory');
        const collection = database.collection('chats');

        let lastTwoMessages = interactionHistoryLogs[pokedexNumber].slice(-2);

        // Add the userId to each message
        lastTwoMessages.forEach(message => {
            message.userId = global.userId;
            message.pokedexNumber = pokedexNumber;
        });

        if (lastTwoMessages.length > 0) {
            await collection.insertMany(lastTwoMessages);
        } else {
            console.log('No messages to save to MongoDB');
        }
    } catch (error) {
        console.error(`Error saving messages to MongoDB for Pokemon #${pokedexNumber} and user ${global.userId}:`, error);
    } finally {
        await localClient.close();
    }
}

async function loadMessagesFromMongoDB(pokedexNumber, userId) {
    try {
        await client.connect();

        const database = client.db('InteractionHistory');
        const collection = database.collection('chats');
        const userId = global.userId

        const cursor = collection.find({ 'pokedexNumber': pokedexNumber, 'userId': userId });
        const results = await cursor.toArray();

        interactionHistoryLogs[pokedexNumber] = results.filter(isMessageWithinDuration);
        runningMemoryLogs[pokedexNumber] = interactionHistoryLogs[pokedexNumber].slice();
    } catch (error) {
        console.error(`Error loading interaction history for Pokemon #${pokedexNumber} and user ${userId} from MongoDB:`, error);
    } finally {
        await client.close();
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
        json.system.rules.join(', '),
        json.trainer.name,
        json.trainer.gender,
        json.pokemon.hobby,
        json.pokemon.entries.join(', '),
        json.pokemon.age,
        json.pokemon.traits.join(', '),
        json.pokemon.species,
        json.pokemon.name,
        json.pokemon.gender
    ].join('');

    const string2 = [
        json.pokemon.nationalPokedexNumber.toString()
    ];

    // Return the pkmnSheet string and the NatonalPokedex number
    return [string1, string2];
}

// Send a message to the Pokemon with message array as well
async function sendChatToPokemon(prompt) {
    try {
        const pokedexNumber = global.selectedPokemon.pokemon.nationalPokedexNumber
        const trainerName = global.selectedPokemon.trainer.name
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
        const pokemonName = global.selectedPokemon.pokemon.name
        console.log(pokemonName + ': ' + output)

        // Save messages to MongoDB
        saveMessagesToMongoDB(pokedexNumber)

        // Add a delay of 200 milliseconds
        await new Promise(resolve => setTimeout(resolve, 200));

        // Return OpenAI's response
        return output

    } catch (error) {
        console.error("Error in sendChatToPokemon:", error);
    }
}

// Function to read all JSON files and extract Pokemon names and Pokedex numbers
async function getAllPokemon() {
    let allPokemon = [];
    const userId = global.userId; // Make sure to set global.userId before calling this function

    // Create a regular expression to match the file name pattern
    const filePattern = new RegExp(`^${userId}\.([^.]+)\.json$`);

    for (const file of jsonFileNames) {
        // Check if the file name matches the desired pattern
        if (filePattern.test(file)) {
            const filePath = `${directoryPath}/${file}`;
            const data = await fs.promises.readFile(filePath);
            const pokemon = JSON.parse(data);
            allPokemon.push({
                species: pokemon.pokemon.species,
                pokedexNumber: pokemon.pokemon.nationalPokedexNumber,
            });
        }
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
            if (pokemonData.pokemon.nationalPokedexNumber == pokedexNumber) {
                console.log(`Found ${pokemonData.pokemon.species}`);
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

function removeNewlines(text) {
    return text.replace(/\n|\f/g, ' ');
}

async function getPokemonEntries(species, count = 5) {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${species.toLowerCase()}`);
        const speciesData = await response.json();
        const entries = speciesData.flavor_text_entries.slice(0, count).map((entry) => removeNewlines(entry.flavor_text));
        const NationalPokedexNumber = speciesData.id;

        return { entries, NationalPokedexNumber };
    } catch (error) {
        console.error('Error fetching Pokémon entries:', error.message);
        return { entries: [], NationalPokedexNumber: null };
    }
}

function capitalizeAndReplace(string) {
    // Replace dashes with spaces
    string = string.replace(/-/g, ' ');
    // Capitalize each word
    string = string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return string;
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
        req.session.user = { id: user._id, username: user.username };
        global.userId = req.session.user.username
        res.redirect('/');
    } else {

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

// Define a route for the create page
app.get('/create', (req, res) => {
    // Query the PokeAPI for all Pokemon species
    const speciesPromise = axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000')
      .then(response => {
        // Extract the names of the Pokemon species
        const speciesNames = response.data.results.map(pokemon => capitalizeAndReplace(pokemon.name));
        return speciesNames;
      })
      .catch(error => {
        console.log(error);
        res.status(500).send('Error retrieving Pokemon data');
      });
  
    // Query the PokeAPI for all Pokemon natures
    const naturesPromise = axios.get('https://pokeapi.co/api/v2/nature')
      .then(response => {
        // Extract the names of the natures
        const natureNames = response.data.results.map(nature => capitalizeAndReplace(nature.name));
        return natureNames;
      })
      .catch(error => {
        console.log(error);
        res.status(500).send('Error retrieving Pokemon data');
      });
  
    // Wait for both promises to resolve, then render the create template
    Promise.all([speciesPromise, naturesPromise])
      .then(([speciesNames, natureNames]) => {
        // Render the create template, passing the species and nature names as variables
        res.render('create', { speciesNames, natureNames });
      })
      .catch(error => {
        console.log(error);
        res.status(500).send('Error retrieving Pokemon data');
      });
  });

app.post('/prompt', isAuthenticated, async (req, res) => {
    const userMessage = req.body.userMessage;

    try {
        const response = await sendChatToPokemon(userMessage);

        res.json({ assistantResponse: `${response}` });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while processing the request" });
    }
});

app.post('/switch', isAuthenticated, async (req, res) => {
    const pokedexNumber = req.body.pokedexNumber;
    console.log('Species Received: ' + pokedexNumber);
    try {
        const selectedPokemon = await getPokemonByPokedexNumber(pokedexNumber);
        global.selectedPokemon = selectedPokemon;
        if (!selectedPokemon) {
            res.status(404).json({ error: "Pokémon not found" });
            return;
        }

        primeChatBot(selectedPokemon);

        res.json({
            assistantResponse: "Switched to new Pokémon!",
            pokedexNumber: selectedPokemon.pokemon.NationalPokedexNumber
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while processing the request" });
        process.exit(1)
    }
});

// API endpoint to handle form data submission
app.post('/api/submit-data', async (req, res) => {
    console.log('Received data:', req.body);

    const userId = global.userId;
    // Save JSON data to the './JSON' folder
    const jsonFolder = './JSON';
    const speciesName = capitalizeAndReplace(req.body.pokemon.species)
    const fileName = `${userId}-${speciesName}.json`;
    const filePath = path.join(jsonFolder, fileName);
    const pokeData = await getPokemonEntries(speciesName);
    console.log(pokeData)

    // JSON object to be added
    const template = {
        system: {
            response: "Response text based on the user input",
            memory: "key-value store of things I should remember about myself and the user",
            topics_to_explore: "detailed description of interesting topics to explore further",
            previous_conversation_points: "list of previous conversation points",
            current_topic: "detailed description of the current topic",
            dreams: "Create simulated detailed description of the system's dreams based on previous conversations",
            inner_dialogue: "Create simulated inner_dialogue based on the conversation",
            private_thoughts: "Create simulated private thoughts based on the conversation",
            rules: [
                "You can use Pokemon sounds at the end or beginning of your responses",
                "Response more like a Pokemon that can talk and less like an AI",
                "If you are unable to provide a reply, you can fake a pokemon noise or confusion"
            ]
        },
        pokemon: {
            species: speciesName,
            entries: pokeData.entries,
            nationalPokedexNumber: pokeData.NationalPokedexNumber
        }
    };

    try {
        // Create the JSON folder if it doesn't exist
        await fs.promises.mkdir(jsonFolder, { recursive: true });

        // Read the existing JSON data from the file if it exists
        let existingData = {};
        if (fs.existsSync(filePath)) {
            const fileData = await fs.promises.readFile(filePath, 'utf-8');
            existingData = JSON.parse(fileData);
        }

        // Merge the received JSON with the existing JSON and the template JSON
        const mergedData = {
            ...existingData,
            ...req.body,
            system: { ...existingData.system, ...req.body.system, ...template.system },
            pokemon: { ...existingData.pokemon, ...req.body.pokemon, ...template.pokemon },
        };

        // Write the merged JSON data back to the file
        await fs.promises.writeFile(filePath, JSON.stringify(mergedData, null, 2));

        // Send a success response
        res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving JSON data:', error);
        res.status(500).json({ message: 'Error saving data' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});