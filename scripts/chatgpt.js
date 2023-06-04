require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
const { saveMessagesToMongoDB, loadMessagesFromMongoDB, runningMemoryLogs, interactionHistoryLogs } = require(`./mondb.js`);
async function primeChatBot(selectedPokemon) {

    const pokedexNumber = selectedPokemon.pokemon.nationalPokedexNumber;
    await loadMessagesFromMongoDB(pokedexNumber, 4000);
    chatHistory = runningMemoryLogs[pokedexNumber]
    return chatHistory
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

        const pkmnSheet = createStringArrayFromJSON(selectedPokemon);
        runningMemoryLogs[pokedexNumber].push({
            role: "system",
            content: pkmnSheet,
            timestamp: new Date().toISOString(),
        });
        const trainerName = selectedPokemon.trainer.name;
        console.log(trainerName + ': ' + prompt)
        let response
        runningMemoryLogs[pokedexNumber].push({ role: "user", content: prompt, timestamp: new Date().toISOString() });
        interactionHistoryLogs[pokedexNumber].push({ role: "user", content: prompt, timestamp: new Date().toISOString() });
        trimmedMemory = runningMemoryLogs[pokedexNumber].filter(({ content }) => content !== undefined && content !== '');
        console.time("Response");
        try {
            response = await openai.createChatCompletion({
                model: "gpt-4",
                messages: trimmedMemory.map(({ role, content }) => ({ role, content })),
                temperature: 0.9,
                max_tokens: 100,
                frequency_penalty: 1.86,
                presence_penalty: 1.8,
                top_p: 1
            });
        } catch (error) {
            console.log("Failing: first Response")
            console.error(error)
            process.exit(1)
        }
        const output_json = response.data.choices
        const firstOutput = output_json[0].message.content

        // const toneFile = "You will verify all text provided to you to ensure the Pokemon's nature. The text needs to be understandable. You will provide just the updated sentence with no headers or additional commentary."

        // let toneMap = [];
        // let toneResponse

        // toneMap.push({
        //     role: "system",
        //     content: toneFile,
        // });

        // try {
        //     primeToneresponse = await openai.createChatCompletion({
        //         model: "gpt-4",
        //         messages: toneMap.map(({ role, content }) => ({ role, content })),
        //         temperature: 0.7,
        //         max_tokens: 100,
        //     });
        // } catch (error) {
        //     console.error(error);
        //     process.exit(1)
        // }

        // try {
        //     toneResponse = await openai.createChatCompletion({
        //         model: "gpt-4",
        //         messages: [...toneMap, { role: "user", content: firstOutput }],
        //         temperature: 0.7,
        //         max_tokens: 100,
        //     });
        // } catch (error) {
        //     console.log("Failing: Tone")
        //     console.error(error)
        //     process.exit(1)
        // }
        // const secondOutput_json = toneResponse.data.choices
        // const secondOutput = secondOutput_json[0].message.content

        // runningMemoryLogs[pokedexNumber].push({ role: "system", content: secondOutput, timestamp: new Date().toISOString() });
        // interactionHistoryLogs[pokedexNumber].push({ role: "system", content: secondOutput, timestamp: new Date().toISOString() });
        // const pokemonName = selectedPokemon.pokemon.name
        // console.log(pokemonName + ': ' + secondOutput)
        // saveMessagesToMongoDB(pokedexNumber)
        // await new Promise(resolve => setTimeout(resolve, 200));
        // console.timeEnd("Response");
        // return secondOutput

        runningMemoryLogs[pokedexNumber].push({ role: "system", content: firstOutput, timestamp: new Date().toISOString() });
        interactionHistoryLogs[pokedexNumber].push({ role: "system", content: firstOutput, timestamp: new Date().toISOString() });
        const pokemonName = selectedPokemon.pokemon.name
        console.log(pokemonName + ': ' + firstOutput)
        saveMessagesToMongoDB(pokedexNumber)
        await new Promise(resolve => setTimeout(resolve, 200));
        console.timeEnd("Response");
        return firstOutput

    } catch (error) {
        console.error("Error in sendChatToPokemon:", error);
    }
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
        return "Invalid JSON";
    }

    const string1 = `Trainer Name: ${json.trainer.name}\n` +
                    `Trainer Gender: ${json.trainer.gender}\n` +
                    `System Rules: ${json.system.rules.join(', ')}\n` +
                    `Pokemon's Hobby: ${json.pokemon.hobby}\n` +
                    `Pokemon's Entries: ${json.pokemon.entries.join('. ')}\n` +
                    `Pokemon's Age: ${json.pokemon.age}\n` +
                    `Pokemon's Traits: ${json.pokemon.traits.join(', ')}\n` +
                    `Pokemon's Species: ${json.pokemon.species}\n` +
                    `Pokemon's Name: ${json.pokemon.name}\n` +
                    `Pokemon's Gender: ${json.pokemon.gender}\n` +
                    `Pokemon's Current Location: ${json.pokemon.currentLocation}`;

    return string1;
}

module.exports = {
    primeChatBot,
    sendChatToPokemon,
};
