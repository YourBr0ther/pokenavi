const submitButton = document.getElementById("submit");
const menuButton = document.getElementById("menu");
const createButton = document.getElementById("create");
const userMessage = document.getElementById("prompt");
const chatMessages = document.getElementById("chat-messages");

function populateDropdown(pokemonList) {
  const dropdown = document.getElementById('switch');
  dropdown.innerHTML = '';

  const defaultOption = document.createElement('option');
  defaultOption.value = "";
  defaultOption.text = "Pokémon";
  dropdown.add(defaultOption);

  for (const pokemon of pokemonList) {
    const option = document.createElement('option');
    option.value = pokemon.pokedexNumber;
    option.text = `${pokemon.species}`;
    dropdown.add(option);
  }
}

function addSystemMessage(messageText) {
  const messageElement = document.createElement("li");
  messageElement.classList.add("received-message");
  messageElement.textContent = messageText;
  chatMessages.appendChild(messageElement);
}

function addUserMessage(messageText) {
  const messageElement = document.createElement("li");
  messageElement.classList.add("sent-message");
  messageElement.textContent = messageText;
  chatMessages.appendChild(messageElement);
}

const scrollToBottom = () => {
  chatMessages.scrollTop = chatMessages.scrollHeight - chatMessages.clientHeight;
};

const submitMessage = async () => {
  const message = userMessage.value;
  userMessage.value = "";

  addUserMessage(`${message}`);
  scrollToBottom();

  const response = await fetch("/prompt", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ userMessage: message })
  });

  const data = await response.json();
  const assistantResponse = data.assistantResponse;

  playSound();

  addSystemMessage(assistantResponse);
  scrollToBottom();
};

submitButton.addEventListener("click", submitMessage);
menuButton.addEventListener("click", logOut);

function logOut() {

  fetch('/logout', { method: 'GET' })
    .then(response => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });

}

function createPokemon() {
  fetch('/create')
}

const switchPrompt = async () => {
  submitButton.disabled = true;
  const pokedexNumber = document.getElementById("switch").value;
  console.log(pokedexNumber)
  const response = await fetch("/switch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ pokedexNumber: pokedexNumber })
  });

  const data = await response.json();
  console.log(data)
  const assistantResponse = data.assistantResponse || `Switched to ${data.pokedexNumber}`;

  const pokemonImg = document.getElementById("sprite");
  const chatWindow = document.getElementById("chat-window"); // Get the chat-window element
  const cacheBuster = new Date().getTime();

  if (pokedexNumber === "133") {
    pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/fe9b71b303647573cd61f92d9a43fd32a47d9c7d/sprites/pokemon/versions/generation-iii/firered-leafgreen/shiny/133.png`;
  } else {
    pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexNumber}.png?${cacheBuster}`;
  }

  chatMessages.innerHTML = "";

  updateChatWindowBgImage(pokemonImg.src);


  const liAssistant = document.createElement("li");
  liAssistant.textContent = `${assistantResponse}`;
  chatMessages.appendChild(liAssistant);

  scrollToBottom();

  const delay = ms => new Promise(res => setTimeout(res, ms));
  await delay(3000);

  submitButton.disabled = false;
};

function updateChatWindowBgImage(imageUrl) {
  const chatWindow = document.getElementById("chat-window");
  const newStyleSheet = document.createElement("style");
  newStyleSheet.innerHTML = `
    #chat-window::before {
      background-image: url('${imageUrl}');
    }
  `;
  document.head.appendChild(newStyleSheet);
}

function playSound() {
  var audio = document.getElementById("myAudio");
  if (audio !== null) {
    audio.volume = 0.3;
    audio.play();
  }
}

userMessage.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitMessage();
  }
});

const switchDropdown = document.getElementById("switch");

if (switchDropdown) {
  switchDropdown.addEventListener("change", async () => {
    if (switchDropdown.value) {
      chatMessages.innerHTML = "Switching!";
      await switchPrompt();
      switchDropdown.value = "";
    }
  });
}

document.getElementById('create').addEventListener('click', function () {
  window.location.href = "create";
});
