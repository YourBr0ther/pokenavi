const submitButton = document.getElementById("submit");
const menuButton = document.getElementById("menu");
const createButton = document.getElementById("create");
const userMessage = document.getElementById("prompt");
const chatMessages = document.getElementById("chat-messages");
document.addEventListener('DOMContentLoaded', populateDropdown);

async function populateDropdown() {
  const response = await fetch('/getActivePokemon');
  const data = await response.json();
  const pokemonList = data.allPokemon;
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

  console.time("Switch");
  submitButton.disabled = true;
  const pokedexNumber = document.getElementById("switch").value;
  const response = await fetch("/switch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ pokedexNumber: pokedexNumber })
  });

  if (!response.ok) {
    console.error('Error switching Pokémon:', response.statusText);
    return;
  }

  const data = await response.json();
  const pokemonImg = document.getElementById("sprite");
  const cacheBuster = new Date().getTime();

  if (pokedexNumber === "133") {
    pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/fe9b71b303647573cd61f92d9a43fd32a47d9c7d/sprites/pokemon/versions/generation-iii/firered-leafgreen/shiny/133.png`;
  } else {
    pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexNumber}.png?${cacheBuster}`;
  }

  // Clear current chat history in the chat box
  chatMessages.innerHTML = '';

  // Load chat history from the response
  const chatHistory = data.chatHistory;
  chatHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  chatHistory.forEach((message) => {
    if (message.role === 'user') {
      addUserMessage(message.content);
    } else if (message.role === 'system') {
      addSystemMessage(message.content);
    } else {
      console.log("error")
    }
  });

  submitButton.disabled = false; // Re-enable the submit button
  scrollToBottom();
  console.timeEnd("Switch");
}

function updateChatWindowBgImage(imageUrl) {
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

// Function to show an error message
function showError() {
  errorShown = true;
  // Create an error message element
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.height = '100%';
  errorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  errorDiv.style.color = 'white';
  errorDiv.style.display = 'flex';
  errorDiv.style.alignItems = 'center';
  errorDiv.style.justifyContent = 'center';
  errorDiv.style.zIndex = '9999';
  errorDiv.innerHTML = '<p>Server is down. Please try again later.</p>';

  // Add the error message element to the body
  document.body.appendChild(errorDiv);
}

// Global variable to track if an error has been shown
let errorShown = false;

// Function to ping the server
async function pingServer() {
  try {
    const response = await fetch('/ping', { method: 'GET' });

    if (!response.ok) {
      showError();
    } else {
      // If the error was shown before and the server is back up, redirect to the login page
      if (errorShown) {
        redirectToLogin();
      }
    }
  } catch (error) {
    showError();
  }
}

// Function to redirect to the login page
function redirectToLogin() {
  window.location.href = '/login';
}

document.getElementById('inventoryButton').addEventListener('click', function() {
  window.open('inventory', 'Pokemon Inventory', 'width=600,height=400');
});

// Call the `pingServer` function every 10 seconds
setInterval(pingServer, 10000);