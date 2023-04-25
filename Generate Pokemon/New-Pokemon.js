// This is the Pokemon Creator script. It will be used to create Generic Pokemon to be used within PokeNavi

// Modules
import inquirer from 'inquirer';
const { create } = require('domain')
const readline = require('readline')

// Answer's array
let answerArray = {

    user_name: "<$trainerName>",
    user_gender: "<$trainerGender>",
    systen_interest: "$hobby" ,
    system_description : ["<$entry1>","<$entry2>","<$entry3>","<$entry4>","<$entry5>"],
    system_age : "<$age>",
    system_personality: "$traits",
    system_species: "<$species>",
    system_name: "<$nickname>",
    system_gender: "<$genderfemale>"

}

const questions = [];

for (const key in answerArray) {
  if (answerArray.hasOwnProperty(key)) {
    const question = {
      type: 'input',
      name: key,
      message: `Please enter your ${key.replace(/_/g, ' ')}:`,
      default: answerArray[key]
    };
    questions.push(question);
  }
}

inquirer
  .prompt(questions)
  .then((answers) => {
    answerArray = Object.assign(answerArray, answers);
  });

// Pokemon template
const template = {

    response : "Response text based on the user input",
    memory : ["key-value store of things I should remember about myself and the user"],
    topics_to_explore: ["detailed description of interesting topics to explore further"],
    previous_conversation_points: ["list of previous conversation points"],
    current_topic: "detailed description of the current topic",
    dreams: "Create simulated detailed description of the system's dreams based on previous conversations",
    inner_dialogue: "Create simulated inner_dialogue based on the conversation",
    private_thoughts: "Create simulated private thoughts based on the conversation",
    user_name: "<$trainerName>",
    user_gender: "<$trainerGender>",
    systen_interest: "$hobby" ,
    system_description : ["<$entry1>","<$entry2>","<$entry3>","<$entry4>","<$entry5>"],
    system_age : "<$age>",
    system_personality: "$traits",
    system_species: "<$species>",
    system_name: "<$nickname>",
    system_gender: "<$genderfemale>"
};

function createPokemon(template, answerArray) {
    for (const key in answerArray) {
        if (template.hasOwnProperty(key)) {
            template[key] = answerArray[key]
        }
    }

    return myPokemon
}

let pokemon = createPokemon()
console.log(pokemon)

