const submitButton = document.getElementById("submit");
const menuButton = document.getElementById("menu");
const createButton = document.getElementById("create");
const userMessage = document.getElementById("prompt");
const messages = document.getElementById("outputContainer");

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

const scrollToBottom = () => {
  messages.scrollTop = messages.scrollHeight - messages.clientHeight;
};

const submitMessage = async () => {
  const message = userMessage.value;
  userMessage.value = "";

  const li = document.createElement("li");
  li.textContent = `   User: ${message}`;
  messages.appendChild(li);

  scrollToBottom()

  const response = await fetch("/prompt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userMessage: message })

  });

  const data = await response.json();
  const assistantResponse = data.assistantResponse;
  console.log(data.systemName)

  playSound()

  const liAssistant = document.createElement("li");
  liAssistant.textContent = `   ${assistantResponse}`;
  console.log(liAssistant.textContent);
  messages.appendChild(liAssistant);

  setTimeout(() => {
    scrollToBottom();
  }, 0);
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
  const cacheBuster = new Date().getTime();

  if (pokedexNumber === "133") {
    pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/fe9b71b303647573cd61f92d9a43fd32a47d9c7d/sprites/pokemon/versions/generation-iii/firered-leafgreen/shiny/133.png`;
  } else {
    pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexNumber}.png?${cacheBuster}`;
  }

  messages.innerHTML = "";

  const liAssistant = document.createElement("li");
  liAssistant.textContent = `${assistantResponse}`;
  messages.appendChild(liAssistant);

  scrollToBottom();

  const delay = ms => new Promise(res => setTimeout(res, ms));
  await delay(3000);

  submitButton.disabled = false;
};

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

switchDropdown.addEventListener("change", async () => {
  if (switchDropdown.value) {
    messages.innerHTML = "Switching!";
    await switchPrompt();
    switchDropdown.value = "";
  }
});

document.getElementById('create').addEventListener('click', function () {
  window.location.href = "create";
});
