document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('pokemonTable').addEventListener('click', function(e){
        if(e.target && e.target.nodeName == "IMG") {
            let activeImages = document.querySelectorAll('#pokemonTable img.active');
            if (e.target.classList.contains('active')) {
                // If the clicked sprite is active, deactivate it
                e.target.classList.remove('active');
            } else if (activeImages.length < 6) {
                // If the clicked sprite is not active, and there are less than 6 active sprites, activate it
                e.target.classList.add('active');
            } else {
                // If there are already 6 active sprites, show an error message
                alert('You can select no more than 6 Pokemon.');
            }
        }
    });

    document.getElementById('submit').addEventListener('click', function() {
        let activePokedexNumbers = [];
        // Get the pokedex numbers of the active Pokemon
        document.querySelectorAll('#pokemonTable img.active').forEach(function(img) {
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
            })
            .catch((error) => {
              alert('An error occurred while updating active Pokemon.');
            });
    });
});
