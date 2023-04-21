console.clear();

const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const fs = require('fs');
const filePath = './PokeCORE/PersonalitySheet.md';
const fileContent = fs.readFileSync(filePath, 'utf-8');

const messages = [];

const primaryPrompt = async (prompt) => {
    messages.push({ role: "system", content: prompt });

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages
    });

    const data = response.data.choices;
    const output = data[0].message.content;

    messages.push({ role: "assistant", content: output });

    return output;
};

primaryPrompt(fileContent);

const runPrompt = async (input) => {
    messages.push({ role: "user", content: input });

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages
    });

    const data = response.data.choices;
    const output = data[0].message.content;

    messages.push({ role: "assistant", content: output });

    return output;
};

const executePrompts = async () => {
    await primaryPrompt(fileContent);
    
    const response1 = await runPrompt('My favorite color is Green');
    console.log(response1);
    
    const response2 = await runPrompt('What type of Pokemon are you?');
    console.log(response2);
    
    const response3 = await runPrompt('What is my favorite color?');
    console.log(response3);
};

executePrompts();
// const express = require('express')
// const app = express()
// const port = 8080



// app.use(express.static('public'))
// app.use(express.json())

// app.get('/info/:dynamic', (req, res) => {
//     const { dynamic } = req.params
//     const { key } = req.query
//     console.log(dynamic, key)
//     res.status(200).send({ info: 'Prompt Information' })
// })

// app.post('/', (req, res) => {
//     const parcel = req.body
//     console.log(parcel)
//     if (!parcel) {
//         return res.status(400).send({ status: 'failed' })
//     }
//     res.status(200).send({ status: 'received' })
// })

// app.listen(port, () => console.log(`Server has started on port: ${port}`))

