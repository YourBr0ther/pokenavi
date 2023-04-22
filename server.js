console.clear()

require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
const express = require("express");
const bodyParser = require("body-parser");

const fs = require('fs');
const path = require('path');
const util = require("util");

const directoryPath = path.join(__dirname, './JSON/');
const jsonFileNames = fs.readdirSync(directoryPath).filter(file => path.extname(file) === '.json');

const jsonFiles = jsonFileNames.map(fileName => {
  const filePath = path.join(directoryPath, fileName);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const jsonData = JSON.parse(fileContent);
  return { fileName, personalitySheet: jsonData.PersonalitySheet };
});


let messages = [];

let primaryPrompt = async (prompt) => {
  messages.push({ role: "system", content: prompt });

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages
  });

  if (response.data.error) {
    console.error(response.data.error);
    return;
  }

  const data = response.data.choices;
  const output = data[0].message.content;

  messages.push({ role: "assistant", content: output });

  return output;
};

let currentPromptIndex = 0;
const promptFile = jsonFiles[currentPromptIndex];

(async () => {
  await primaryPrompt(promptFile.personalitySheet);
})();

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

const readFile = util.promisify(fs.readFile);

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

app.post('/switch', (req, res) => {
  fs.readdir('./JSON', (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    const currentIndex = files.indexOf(selectedFile);
    console.log('currentIndex:', currentIndex);

    const nextIndex = (currentIndex + 1) % files.length;
    console.log('nextIndex:', nextIndex);

    selectedFile = files[nextIndex];
    console.log('selectedFile:', selectedFile);

    fs.readFile(`./JSON/${selectedFile}`, 'utf-8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }

      primaryPrompt = JSON.parse(data).personalitySheet;
      messages = [];
      runPrompt(primaryPrompt, messages);

      res.status(200).send({ selectedFile, messages });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
