console.clear()
require('dotenv').config();
const {
    getAllPokemon,
    getPokemonByPokedexNumber,
    User,
    LoginDemoConnection,
    PokemonListConnection
} = require('./scripts/mongo');
const { primeChatBot, sendChatToPokemon } = require('./scripts/chatbot');
const express = require("express");
const bodyParser = require("body-parser");
const axios = require('axios');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
let userId

async function getPokemonEntries(species, count = 5) {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${species.toLowerCase()}`);
        const speciesData = await response.json();
        const entries = (speciesData.flavor_text_entries.slice(0, count).map((entry)).replace(/\n|\f/g, ' '))
        const NationalPokedexNumber = speciesData.id;

        return { entries, NationalPokedexNumber };
    } catch (error) {
        console.error('Error fetching Pokémon entries:', error.message);
        return { entries: [], NationalPokedexNumber: null };
    }
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
            const speciesNames = ((response.data.results.map(pokemon.name).replace(/-/g, ' ')).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
            return speciesNames;
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Error retrieving Pokemon data');
        });

    const naturesPromise = axios.get('https://pokeapi.co/api/v2/nature')
        .then(response => {
            const natureNames = ((response.data.results.map(nature.name).replace(/-/g, ' ')).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
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

    const speciesName = ((req.body.pokemon.species.replace(/-/g, ' ')).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
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