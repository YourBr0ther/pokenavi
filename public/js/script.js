window.onload = function () {
  document.getElementById('toggle-button').addEventListener('click', function () {
    var panel = document.getElementById('chat-panel');
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
    } else {
      panel.classList.add('open');
    }
  });
}

document.addEventListener('DOMContentLoaded', populateActivePokemon);
const chatMessages = document.getElementById("chat-messages");

const scrollToBottom = () => {
  chatMessages.scrollTop = chatMessages.scrollHeight - chatMessages.clientHeight;
};

const switchPrompt = async (selectedPokedexNumber) => {
  if (!selectedPokedexNumber) {
    // No pokemon selected, so don't attempt to switch
    return;
  }
  const pokedexNumber = selectedPokedexNumber;
  console.log(pokedexNumber)
  console.time("Switch");
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
  // const cacheBuster = new Date().getTime();
  // if (pokedexNumber === "133") {
  //   pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/fe9b71b303647573cd61f92d9a43fd32a47d9c7d/sprites/pokemon/versions/generation-iii/firered-leafgreen/shiny/133.png`;
  // } else {
  //   pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexNumber}.png?${cacheBuster}`;
  // }

  // Clear current chat history in the chat box
  chatMessages.innerHTML = '';

  // updateChatWindowBgImage(pokemonImg.src);

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

  scrollToBottom();
  console.timeEnd("Switch");
}

let selectedPokedexNumber = null;

async function populateActivePokemon() {
  const response = await fetch('/getActivePokemon');
  const data = await response.json();
  const pokemonList = data.allPokemon;
  const dropdown = document.getElementById('switch');
  dropdown.innerHTML = '';

  const defaultOption = document.createElement('li');
  defaultOption.setAttribute('data-value', '');
  defaultOption.textContent = "Pokémon";
  dropdown.appendChild(defaultOption);

  for (const pokemon of pokemonList) {
    const listItem = document.createElement('li');
    listItem.setAttribute('data-value', pokemon.pokedexNumber);
    listItem.textContent = pokemon.species;
    dropdown.appendChild(listItem);

    // add click event listener to each list item
    // Inside populateActivePokemon function
    listItem.addEventListener('click', function () {
      const selectedValue = this.getAttribute('data-value');
      const listItems = this.parentElement.children; // get all list items

      // If the Pokémon is already selected, unselect it
      if (selectedPokedexNumber === pokemon.pokedexNumber) {
        selectedPokedexNumber = null; // Clear the selected pokedex number
        for (const item of listItems) {
          item.classList.remove('selected'); // Remove the 'selected' class from all items
        }
        // Potentially call switchPrompt with null or another method to handle unselect
        // switchPrompt(null);
      }
      // If the Pokémon is not selected, select it
      else {
        selectedPokedexNumber = pokemon.pokedexNumber; // Update the selected pokedex number
        for (const item of listItems) {
          if (item.getAttribute('data-value') === selectedValue) {
            item.classList.add('selected'); // Add the 'selected' class to the selected item
          } else {
            item.classList.remove('selected'); // Remove the 'selected' class from all other items
          }
        }
        switchPrompt(selectedPokedexNumber); // Call the switchPrompt function
      }
    });

  }
}

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

function addSystemMessage(messageText) {
  const messageElement = document.createElement("li");
  messageElement.classList.add("received-message"); // Apply the received-message class
  messageElement.textContent = messageText;
  chatMessages.appendChild(messageElement);
}

function addUserMessage(messageText) {
  const messageElement = document.createElement("li");
  messageElement.classList.add("sent-message"); // Apply the sent-message class
  messageElement.textContent = messageText;
  chatMessages.appendChild(messageElement);
}

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

const submitButton = document.getElementById("submit-button");
submitButton.addEventListener("click", submitMessage);

const settingsButton = document.getElementById("settings-button");
settingsButton.addEventListener("click", logOut);

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


// Function to redirect to the login page
function redirectToLogin() {
  window.location.href = '/login';
}


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

function createPokemon() {
  fetch('/create')
}

document.getElementById('create').addEventListener('click', function () {
  window.location.href = "create";
});

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


let logoutTimer;

function resetLogoutTimer() {
  clearTimeout(logoutTimer);
  logoutTimer = setTimeout(logOut, 600000); // Auto-logout after 10 minutes of inactivity
}

window.onload = resetLogoutTimer;
document.onmousemove = resetLogoutTimer;
document.onmousedown = resetLogoutTimer; // catches touchscreen presses
document.ontouchstart = resetLogoutTimer;
document.onclick = resetLogoutTimer;     // catches touchpad clicks
document.onscroll = resetLogoutTimer;    // catches scrolling with arrow keys
document.onkeypress = resetLogoutTimer;

// Call the `pingServer` function every 10 seconds
setInterval(pingServer, 10000);