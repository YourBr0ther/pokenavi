# PokeNavi
A new way to interact with Pokemon from your previous games

## Summary
I want to create a way for us to use Pokemon as our personal assistant using PokeDex entries, Pokemon hobbies, and personality traits. Eventually with ChatGPT4, I will be able to add some additonal features to create a pusedo consciousness. I also eventually want to make it where you can import Pokemon directly from Pk files from PkHex. This would add an additional level of uniqueness that generic Pokemon created via the web app won't be able to mimic.

### Examples
* [Login](/pictures/Login.png)
* [Homepage](/pictures/Homepage.png)
* [Chat](/pictures/Chat.png)
* [Creation](/pictures/Creation.png)

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
    copy .env-template and rename it .env

### Add your OpenAI key and Mongo key to the .env file using this format
    OPENAI_API_KEY=XXXX
    MONGODB_SECRET=XXXX
    MONGODB_SERVER=XXXX

### Start PokeNavi
    node server.js

## Todo Lists

### Authentic Attributes
* Convert the Powershell to NodeJS
* Successfully import the 80 bytes into PokeNavi

### Backend Development
* PokeCORE integration [work in progress]

### Frontend Development
* Comment the HTML

### PokeCORE 
* Enter idle mode [?]
* Brain [Parent]
  * Id [Instincts]
  * Ego [Reality]
  * Superego [Morality]

### Skill Roadmap
 * Release version 1.0.0
 * NovelAI TTS
 * Check Weather
 * Check Calendar
 * Allow Pokemon to dream
 * Play basic music
 * Search Google via Google search or Bard [Coming soon in ChatGPT4]

