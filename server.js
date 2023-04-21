require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const bodyParser = require("body-parser");
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, './PokeCORE/');
const markdownFileNames = fs.readdirSync(directoryPath).filter(file => path.extname(file) === '.txt');

const markdownFiles = markdownFileNames.map(fileName => {
  const filePath = path.join(directoryPath, fileName);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return { fileName, fileContent };
});

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

let currentPromptIndex = 0;
const promptFile = markdownFiles[currentPromptIndex];

primaryPrompt(promptFile.fileContent);

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

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public")); // Serve the static HTML files from the 'public' folder

app.post("/prompt", async (req, res) => {
  const userMessage = req.body.userMessage;

  try {
    const response = await runPrompt(userMessage);
    res.json({ assistantResponse: response });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while processing the request" });
  }
});

app.post("/switch", async (req, res) => {
  currentPromptIndex = (currentPromptIndex + 1) % markdownFiles.length;
  const promptFile = markdownFiles[currentPromptIndex];
  messages.length = 0;
  try {
    const response = await primaryPrompt(promptFile.fileContent);
    res.json({ assistantResponse: response });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while processing the request" });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});