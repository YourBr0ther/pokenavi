console.clear()
require('dotenv').config();
const { primeChatBot, sendChatToPokemon } = require(`./scripts/chatgpt.js`);
const {
    getAllPokemon,
    updateActivePokemon,
    getActivePokemon,
    User,
    LoginDemoConnection,
    PokemonListConnection,
    runningMemoryLogs
} = require(`./scripts/mondb.js`);
const { getPokemonEntries, getAllSpeciesNames, getAllNatureNames,getPokemonTypes } = require(`./scripts/pokeapi.js`);
const cron = require('node-cron');
const { updatePokemonLocations } = require(`./scripts/thepokecore.js`);
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');

let userId

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
    cookie: {
        maxAge: 10 * 60 * 1000,
    },
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
    const { username, password, passwordConfirm, securityQuestion, securityAnswer } = req.body;

    // validate password confirmation
    if (password !== passwordConfirm) {
        // respond with an error
        return res.status(400).send('Passwords do not match');
    }

    // hash the password and the security answer
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(securityAnswer, 10);

    // create a new user object
    const user = new User({
        username, 
        password: hashedPassword,
        securityQuestion,
        securityAnswer: hashedAnswer
    });

    // handle saving the user in a try/catch block
    try {
        await user.save();
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering new user, please try again.');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/create', (req, res) => {

    const speciesPromise = getAllSpeciesNames()
    const naturesPromise = getAllNatureNames()
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

        // save the user and assistant messages in runningMemoryLogs
        const pokedexNumber = JSON.parse(global.selectedPokemon).pokemon.nationalPokedexNumber;
        if (!runningMemoryLogs[pokedexNumber]) {
            runningMemoryLogs[pokedexNumber] = [];
        }
        runningMemoryLogs[pokedexNumber].push({ text: userMessage, role: 'user', timestamp: new Date() });
        runningMemoryLogs[pokedexNumber].push({ text: response, role: 'assistant', timestamp: new Date() });

        res.json({ assistantResponse: `${response}` });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while processing the request" });
    }
});

app.post('/switch', isAuthenticated, async (req, res) => {
    try {
        const pokedexNumber = req.body.pokedexNumber;
        const selectedPokemon = await getAllPokemon(pokedexNumber);
        const selectedPokemonJson = JSON.stringify(selectedPokemon);
        global.selectedPokemon = selectedPokemonJson;
        if (!selectedPokemon) {
            res.status(404).json({ error: "Pokémon not found" });
            return;
        }
        chatHistory = await primeChatBot(selectedPokemon);
        chatHistory.pop()
        res.json({
            assistantResponse: "Switched to new Pokémon!",
            'pokedexNumber': pokedexNumber,
            chatHistory: chatHistory
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
    const pokeTypes = await getPokemonTypes(speciesName)
    const template = {
        trainer: {
            UserId: `${userId}`
        },
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
            type1: pokeTypes.type1,
            type2: pokeTypes.type2,
            nationalPokedexNumber: pokeData.NationalPokedexNumber,
            currentLocation: "Pokemon Laboratory",
            locationExpiration: "",
            isActive: "false"
        }
    };

    try {

        const database = PokemonListConnection.client.db(`Pokemon`);
        const collection = database.collection(`PC`);
        const existingData = await collection.findOne({ 'pokemon.species': speciesName });
        const mergedData = {
            ...existingData,
            ...req.body,
            trainer: { ...existingData?.trainer, ...req.body.trainer, ...template.trainer },
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

app.get('/inventory', async function (req, res) {
    let allPokemon = await getAllPokemon();
    res.render('inventory', { allPokemon: allPokemon });
});

app.post('/updateActivePokemon', async function (req, res) {
    try {
        const activePokedexNumbers = req.body;
        const userId = global.userId; // You need to replace this with the actual user ID

        // Call the function to update the active Pokemon in the database
        await updateActivePokemon(activePokedexNumbers, userId);

        res.json({ message: 'Active Pokemon updated successfully' }); // Send a JSON response
    } catch (error) {
        console.error('Error updating active Pokemon:', error);
        res.status(500).json({ message: 'Error updating active Pokemon' });
    }
});

app.get('/getActivePokemon', async function (req, res) {
    let activePokemon = await getActivePokemon();
    res.json({ allPokemon: activePokemon });
});

app.get('/ping', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);

    cron.schedule('*/60 * * * *', async () => {
        try {
            await updatePokemonLocations();
            console.log('Updated Pokemon locations');
        } catch (error) {
            console.error('Failed to update Pokemon locations:', error);
        }
    });

});
