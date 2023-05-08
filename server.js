console.clear()
require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
const express = require("express");
const bodyParser = require("body-parser");
const axios = require('axios');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const PokemonSchema = new mongoose.Schema({
    pokemon: {
        species: { type: String, required: true },
        nationalPokedexNumber: { type: Number, required: true },
    },
});

let userId

const uriLoginDemo = `mongodb://${process.env.MONGODB_SERVER}:27017/loginDemo`;
const uriInteractionHistory = `mongodb://${process.env.MONGODB_SERVER}:27017/InteractionHistory`;
const uriPokemonList = `mongodb://${process.env.MONGODB_SERVER}/Pokemon`;
const LoginDemoConnection = mongoose.createConnection(uriLoginDemo, { useNewUrlParser: true, useUnifiedTopology: true });
const interactionHistoryConnection = mongoose.createConnection(uriInteractionHistory, { useNewUrlParser: true, useUnifiedTopology: true });
const PokemonListConnection = mongoose.createConnection(uriPokemonList, { useNewUrlParser: true, useUnifiedTopology: true });

const createUserModel = require('./models/User');
const User = createUserModel(LoginDemoConnection);
const runningMemoryLogs = {}
const interactionHistoryLogs = {}
const conversationMemoryDuration = 7 * 24 * 60 * 60 * 1000

async function primeChatBot(selectedPokemon) {
    let response;

    if (selectedPokemon) {
        const pokedexNumber = selectedPokemon.pokemon.nationalPokedexNumber;
        await loadMessagesFromMongoDB(pokedexNumber, 4096);
        const [pkmnSheet, string2] = await createStringArrayFromJSON(selectedPokemon);

        if (!runningMemoryLogs[pokedexNumber]) {
            runningMemoryLogs[pokedexNumber] = [];
        }
        runningMemoryLogs[pokedexNumber].push({
            role: "system",
            content: pkmnSheet,
            timestamp: new Date().toISOString(),
        });
        const primeRunningMemory = runningMemoryLogs[pokedexNumber].slice();
        primeRunningMemory.push({
            role: "system",
            content: pkmnSheet,
            timestamp: new Date().toISOString(),
        });
        try {
            response = await openai.createChatCompletion({
                model: "gpt-4",
                messages: primeRunningMemory.map(({ role, content }) => ({ role, content })),
                temperature: 0.7,
                max_tokens: 25,
            });
            console.log("Ready to receive requests");
            return response;
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    } else {
        console.log("No selected pokemon");
        process.exit(1);
    }
}

async function saveMessagesToMongoDB(pokedexNumber) {

    try {

        const database = interactionHistoryConnection.client.db('InteractionHistory');
        const collection = database.collection('chats');
        let lastTwoMessages = interactionHistoryLogs[pokedexNumber].slice(-2);
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
    }
}

async function loadMessagesFromMongoDB(pokedexNumber, tokenLimit) {
    try {

        const database = interactionHistoryConnection.client.db('InteractionHistory');
        const collection = database.collection('chats');
        const userId = global.userId
        const cursor = collection.find({ 'pokedexNumber': pokedexNumber, 'userId': userId }).sort({ _id: -1 });

        const results = await cursor.toArray();
        let tokenCount = 0;
        const filteredResults = results.filter((message) => {
            const messageTokenCount = message.text ? message.text.length : 0;
            tokenCount += messageTokenCount;
            return tokenCount <= tokenLimit;
        });

        interactionHistoryLogs[pokedexNumber] = filteredResults.filter(isMessageWithinDuration);
        runningMemoryLogs[pokedexNumber] = interactionHistoryLogs[pokedexNumber].slice();
    } catch (error) {
        console.error(`Error loading interaction history for Pokemon #${pokedexNumber} and user ${userId} from MongoDB:`, error);
    }
}

function isMessageWithinDuration(message) {
    const messageTimestamp = new Date(message.timestamp).getTime();
    const currentTimestamp = new Date().getTime();

    return currentTimestamp - messageTimestamp <= conversationMemoryDuration;
}

function createStringArrayFromJSON(jsObject) {
    const jsonString = JSON.stringify(jsObject);
    const json = JSON.parse(jsonString);

    if (
        !json.pokemon ||
        !json.system ||
        !json.system.rules ||
        !json.trainer
    ) {
        console.error("Error: The JSON object does not have the expected structure.");
        return ["Invalid JSON", "Invalid JSON"];
    }

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

    return [string1, string2];
}

async function sendChatToPokemon(prompt) {
    try {
        let selectedPokemon;
        try {
            selectedPokemon = JSON.parse(global.selectedPokemon);
        } catch (error) {
            console.error("Error parsing global.selectedPokemon:", error);
            return;
        }

        if (!selectedPokemon.pokemon) {
            console.error("Error: selectedPokemon.pokemon is undefined");
            return;
        }

        const pokedexNumber = selectedPokemon.pokemon.nationalPokedexNumber;
        const trainerName = selectedPokemon.trainer.name;
        console.log(trainerName + ': ' + prompt)
        let response
        runningMemoryLogs[pokedexNumber].push({ role: "user", content: prompt, timestamp: new Date().toISOString() });
        interactionHistoryLogs[pokedexNumber].push({ role: "user", content: prompt, timestamp: new Date().toISOString() });

        runningMemoryLogs[pokedexNumber].forEach((element) => {
        });
        console.time("Response");
        try {
            response = await openai.createChatCompletion({
                model: "gpt-4",
                messages: runningMemoryLogs[pokedexNumber].map(({ role, content }) => ({ role, content })), // Only send messages for this Pokemon
                temperature: 0.7,
                max_tokens: 25,
            });
        } catch (error) {
            console.log("Failing")
            console.error(error)
            process.exit(1)
        }
        const output_json = response.data.choices
        const firstOutput = output_json[0].message.content

        const toneFile = "You will verify all text provided to you to ensure the Pokemon's nature and age are reflected correctly. The text needs to be understandable. You will provide just the updated sentence with no headers or additional commentary."

        let toneMap = [];
        let toneResponse

        toneMap.push({
            role: "system",
            content: toneFile,
        });

        try {
            let primeToneresponse
            primeToneresponse = await openai.createChatCompletion({
                model: "gpt-4",
                messages: toneMap.map(({ role, content }) => ({ role, content })),
                temperature: 0.7,
                max_tokens: 25,
            });
        } catch (error) {
            console.error(error);
            process.exit(1)
        }

        try {
            toneResponse = await openai.createChatCompletion({
                model: "gpt-4",
                messages: [...toneMap, { role: "user", content: firstOutput }],
                temperature: 0.7,
                max_tokens: 100,
            });
        } catch (error) {
            console.log("Failing")
            console.error(error)
            process.exit(1)
        }
        const secondOutput_json = toneResponse.data.choices
        const secondOutput = secondOutput_json[0].message.content

        runningMemoryLogs[pokedexNumber].push({ role: "system", content: secondOutput, timestamp: new Date().toISOString() });
        interactionHistoryLogs[pokedexNumber].push({ role: "system", content: secondOutput, timestamp: new Date().toISOString() });
        const pokemonName = selectedPokemon.pokemon.name
        console.log(pokemonName + ': ' + secondOutput)
        saveMessagesToMongoDB(pokedexNumber)
        await new Promise(resolve => setTimeout(resolve, 200));
        console.timeEnd("Response");
        return secondOutput

    } catch (error) {
        console.error("Error in sendChatToPokemon:", error);
    }
}

async function getAllPokemon() {
    let allPokemon = [];
    const userId = global.userId;

    try {
        await mongoose.connect(`mongodb://${process.env.MONGODB_SERVER}:27017/Pokemon`);
        const PokemonModel = mongoose.model(userId, PokemonSchema, userId);
        const pokemonDocs = await PokemonModel.find();
        allPokemon = pokemonDocs.map((doc) => ({
            species: doc.pokemon.species,
            pokedexNumber: doc.pokemon.nationalPokedexNumber,
        }));
    } catch (err) {
        console.error(err);
    }
    return allPokemon;
}

async function getPokemonByPokedexNumber(pokedexNumber) {
    const userId = global.userId;

    try {
        await mongoose.connect(`mongodb://${process.env.MONGODB_SERVER}:27017/Pokemon`);
        const PokemonModel = mongoose.model(userId, PokemonSchema, userId);
        const pokemonData = await PokemonModel.findOne({
            'pokemon.nationalPokedexNumber': Number(pokedexNumber),
        });

        if (pokemonData) {
            return pokemonData;
        } else {
            console.log(`Pokemon with Pokedex number ${pokedexNumber} not found`);
            return null;
        }
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
    string = string.replace(/-/g, ' ');
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

const app = express()
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/login', (req, res) => {
    res.render('login');
});

app.use(session({
    secret: `${process.env.MONGODB_SECRET}`,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ client: LoginDemoConnection.getClient() }),
}));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = { id: user._id, username: user.username };
            global.userId = req.session.user.username;
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('An error occurred while processing your request. Please try again later.');
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

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    await user.save();
    res.redirect('/login');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/create', (req, res) => {
    const speciesPromise = axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000')
        .then(response => {
            const speciesNames = response.data.results.map(pokemon => capitalizeAndReplace(pokemon.name));
            return speciesNames;
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Error retrieving Pokemon data');
        });

    const naturesPromise = axios.get('https://pokeapi.co/api/v2/nature')
        .then(response => {
            const natureNames = response.data.results.map(nature => capitalizeAndReplace(nature.name));
            return natureNames;
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Error retrieving Pokemon data');
        });

    Promise.all([speciesPromise, naturesPromise])
        .then(([speciesNames, natureNames]) => {
            res.render('create', { speciesNames, natureNames });
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Error retrieving Pokemon data');
        });
});

app.post('/prompt', isAuthenticated, async (req, res) => {
    const userMessage = req.body.userMessage;
    console.log(userMessage)

    try {
        const response = await sendChatToPokemon(userMessage);
        res.json({ assistantResponse: `${response}` });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while processing the request" });
    }
});

app.post('/switch', isAuthenticated, async (req, res) => {
    try {
        const pokedexNumber = req.body.pokedexNumber;
        const selectedPokemon = await getPokemonByPokedexNumber(pokedexNumber);
        const selectedPokemonJson = JSON.stringify(selectedPokemon);
        global.selectedPokemon = selectedPokemonJson;
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
        process.exit(1);
    }
});

app.post('/api/submit-data', async (req, res) => {
    const userId = global.userId;

    const speciesName = capitalizeAndReplace(req.body.pokemon.species)
    const pokeData = await getPokemonEntries(speciesName);
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

        const database = PokemonListConnection.db(`${userId}`);
        const collection = database.collection('chats');
        const existingData = await collection.findOne({ 'pokemon.species': speciesName });
        const mergedData = {
            ...existingData,
            ...req.body,
            system: { ...existingData?.system, ...req.body.system, ...template.system },
            pokemon: { ...existingData?.pokemon, ...req.body.pokemon, ...template.pokemon },
        };

        await collection.updateOne({ 'pokemon.species': speciesName }, { $set: mergedData }, { upsert: true });

        res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving JSON data:', error);
        res.status(500).json({ message: 'Error saving data' });
    }
});

app.get('/ping', (req, res) => {
    res.status(200).send('OK');
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});