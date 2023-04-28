# PokeNavi
A new way to interact with Pokemon from your previous games

### Summary
I want to create a way for us to interact with our Pokemon using the metadata from the game, MBTI personality types, and ChatGPT to create a personable assistant based on your actual Pokemon. I am wanting to create some addition bots that will act as certain personality aspects or to interactive with other services until plugins become available.

### Example
![Browser Image](/Example/PokeNavi.png)

### Requirements
 * [NodeJS](https://nodejs.org/en)
 * [OpenAI Key](https://platform.openai.com/account/api-keys)
 * [MongoDB](https://www.mongodb.com/)

### Supported Operating Systems
 * Windows
 * Linux
 * macOS

### Installation
    git clone https://github.com/YourBr0ther/PokeNavi
    cd PokeNavi
    npm install
    mkdir .env

Add your OpenAI key to the .env file using this format
    OPENAI_API_KEY=XXXX
Add your Mongo secret key to the .env file using this format
    MONGODB_SECRET=XXXX

### Pokemon Creation
    node newPokemon.js

### Start PokeNavi
    node server.js

## To-Do
* Migrate chats to MongoDB
  * Per Pokemon \ Per User
* Add a party system and PC system
  * Select 6 for Party
  * Check boxes showing all registered Pokemon
  * Save button on selected Pokemon
* Creation Screen Changes
  * Update creation screen with current theme
  * Update the creation screen to include the bot specific information
* Add injection commands

### Features
* Import a authentic Gen1 through Gen3 Pokemon

### Authentic Attributes
* Add second Typing
* Fix DATA block decryption [G.A.M.E.]

### Backend Development
* PokeCORE integration

### Frontend Development
* Comment the HTML

### Conscious Bot Creation [PokeCORE]
* Brain [Parent]
  * Id [Instincts]
  * Ego [Reality]
  * Superego [Morality]
* Memory Cell [work in progress]

### Skill Roadmap
 * Release version 1.0.0
 * NovelAI TTS
 * Check Weather
 * Check Calendar
 * Allow Pokemon to dream
 * Play basic music
 * Search Google via Google search or Bard
