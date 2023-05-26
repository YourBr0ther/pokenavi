window.onload = function() {
  document.getElementById('toggle-button').addEventListener('click', function() {
      var panel = document.getElementById('chat-panel');
      if (panel.classList.contains('open')) {
          panel.classList.remove('open');
      } else {
          panel.classList.add('open');
      }
  });
}

document.addEventListener('DOMContentLoaded', populateActivePokemon);

async function populateActivePokemon() {
  const response = await fetch('/getActivePokemon');
  const data = await response.json();
  const pokemonList = data.allPokemon;
  const list = document.getElementById('switch');
  list.innerHTML = '';

  const defaultOption = document.createElement('li');
  defaultOption.setAttribute('data-value', '');
  defaultOption.textContent = "Pokémon";
  list.appendChild(defaultOption);

  for (const pokemon of pokemonList) {
    const listItem = document.createElement('li');
    listItem.setAttribute('data-value', pokemon.pokedexNumber);
    listItem.textContent = pokemon.species;
    list.appendChild(listItem);
  }
}