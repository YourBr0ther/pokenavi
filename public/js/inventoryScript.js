document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('pokemonTable').addEventListener('click', function (e) {
    if (e.target && e.target.nodeName === 'IMG') {
      const targetImg = e.target;

      if (targetImg.classList.contains('active')) {
        // If the clicked sprite is active, deactivate it and remove the shadow
        targetImg.classList.remove('active');
        targetImg.style.boxShadow = '';
      } else {
        const activeImages = document.querySelectorAll('#pokemonTable img.active');
        if (activeImages.length < 6) {
          // If the clicked sprite is not active and there are less than 6 active sprites, activate it and apply the shadow
          targetImg.classList.add('active');
          targetImg.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        } else {
          // If there are already 6 active sprites, show an error message
          alert('You can select no more than 6 Pokemon.');
        }
      }
    }
  });

  document.getElementById('submit').addEventListener('click', function () {
    let activePokedexNumbers = [];
    // Get the pokedex numbers of the active Pokemon
    document.querySelectorAll('#pokemonTable img.active').forEach(function (img) {
      activePokedexNumbers.push(img.getAttribute('data-pokedex-number'));
    });

    // Construct your fetch request here, replace with actual API endpoint
    fetch('/updateActivePokemon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activePokedexNumbers),
    })
      .then((response) => response.json())
      .then((data) => {
        alert('Active Pokemon updated successfully!');

        // Close the inventory window
        console.log('closing window')
        window.close();

        // Refresh the main window
        console.log('reloading')
        window.opener.location.reload();
      });

  });

  fetch('/getActivePokemon')
    .then((response) => response.json())
    .then((data) => {
      const activePokemon = data.allPokemon;
      applyShadowToActivePokemon(activePokemon);
    })
    .catch((error) => {
      console.error('Error retrieving active Pokemon:', error);
    });

});

function applyShadowToActivePokemon(activePokemon) {
  // Apply shadow effect to active Pokemon sprites
  document.querySelectorAll('#pokemonTable img').forEach(function (img) {
    const pokedexNumber = img.getAttribute('data-pokedex-number');
    const isActive = activePokemon.some(pokemon => pokemon.pokedexNumber === parseInt(pokedexNumber));

    if (isActive) {
      img.classList.add('active');
      img.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
      console.log(`Applied shadow to Pokemon with Pokedex Number: ${pokedexNumber}`);
    }
  });
}