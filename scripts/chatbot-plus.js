console.clear()
require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

async function sendToC(userPrompt, oAnswer, RAnswer, EAnswer) {

    const prompt = `This is a Simulation. You will review the three "thoughts" and determine how best to answer the user. Your Observeration tells you: ${oAnswer}. Your Reflection tells you ${RAnswer}. Your Experience tells you ${EAnswer}`
    let promptThoughts = []
    promptThoughts.push({
        role: "system",
        content: prompt,
        timestamp: new Date().toISOString(),
    });

    promptThoughts.push({
        role: "user",
        content: userPrompt,
        timestamp: new Date().toISOString(),
    });

    let response

    try {
        response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: promptThoughts.map(({ role, content }) => ({ role, content })),
            temperature: 0.7,
            max_tokens: 50,
        });
    } catch (error) {
        console.log("Failing: Cognition Prompt")
        console.error(error)
        process.exit(1)
    }
    const output_json = response.data.choices
    const CognitionAnswer = output_json[0].message.content
    console.log('')
    console.log("Cognition: " + CognitionAnswer)
    return CognitionAnswer
}

async function sendToO(userPrompt) {

    const prompt = "This is a Simulation. You are a Charmeleon named Maggie in a Magma Cavern. How would you respond to the user's question?"
    let promptThoughts = []
    promptThoughts.push({
        role: "system",
        content: prompt,
        timestamp: new Date().toISOString(),
    });

    promptThoughts.push({
        role: "user",
        content: userPrompt,
        timestamp: new Date().toISOString(),
    });

    let response
    try {
        response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: promptThoughts.map(({ role, content }) => ({ role, content })),
            temperature: 0.7,
            max_tokens: 50,
        });
    } catch (error) {
        console.log("Failing: Observation Prompt")
        console.error(error)
        process.exit(1)
    }
    const output_json = response.data.choices
    const ObservationAnswer = output_json[0].message.content

    console.log("Observation: " + ObservationAnswer)
    console.log('')
    return ObservationAnswer
}

async function sendToR(userPrompt) {

    const prompt = "This is a Simulation. You are a shy natured Charmeleon named Maggie. How would you reply to the user?"
    let promptThoughts = []
    promptThoughts.push({
        role: "system",
        content: prompt,
        timestamp: new Date().toISOString(),
    });

    promptThoughts.push({
        role: "user",
        content: userPrompt,
        timestamp: new Date().toISOString(),
    });

    let response
    try {
        response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: promptThoughts.map(({ role, content }) => ({ role, content })),
            temperature: 0.7,
            max_tokens: 50,
        });
    } catch (error) {
        console.log("Failing: Reflection Prompt")
        console.error(error)
        process.exit(1)
    }
    const output_json = response.data.choices
    const ReflectionAnswer = output_json[0].message.content

    console.log("Reflection: " + ReflectionAnswer)
    console.log('')
    return ReflectionAnswer
}
async function sendToE(userPrompt) {

    const prompt = "This is a Simulation. You are a Charmeleon named Maggie. You remember your Trainer's name is Chris. You remmber his Favorite color is Green. You remember he is married. You remember he has a daughter. Based on your simulated memories, how would you respond to the user?"
    let promptThoughts = []
    promptThoughts.push({
        role: "system",
        content: prompt,
        timestamp: new Date().toISOString(),
    });

    promptThoughts.push({
        role: "user",
        content: userPrompt,
        timestamp: new Date().toISOString(),
    });

    let response
    try {
        response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: promptThoughts.map(({ role, content }) => ({ role, content })),
            temperature: 0.7,
            max_tokens: 50,
        });
    } catch (error) {
        console.log("Failing: Experience Prompt")
        console.error(error)
        process.exit(1)
    }
    const output_json = response.data.choices
    const ExperienceAnswer = output_json[0].message.content

    console.log("Experience: " + ExperienceAnswer)
    console.log('')
    return ExperienceAnswer
}

async function main() {

    console.time("Response")
    const userPrompt = "Hey there! What are you up too, Maggie?";
    const oAnswer = await sendToO(userPrompt);
    const RAnswer = await sendToR(userPrompt);
    const EAnswer = await sendToE(userPrompt);

    const cAnswer = await sendToC(userPrompt, oAnswer, RAnswer, EAnswer);
    console.timeEnd("Response")
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});