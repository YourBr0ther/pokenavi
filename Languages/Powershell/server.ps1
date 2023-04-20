
function Get-stuff {

    Write-Host "Hello world"

    $test = "string test"

    return $test

}

Start-PodeServer {
    Add-PodeEndpoint -Address localhost -Port 8080 -Protocol Http

    Set-PodeViewEngine -Type Pode

    # "Push"
    Add-PodeRoute -Method Get -Path '/' -ScriptBlock {

        Get-stuff
        $jsonPokemon = Get-Content -Path ".\JSON\Charmeleon.json" -Raw
        $pokemon = $jsonPokemon | ConvertFrom-Json
        $pokemon_sprite = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/$($pokemon.'NationalPokedexNumber').png"
        
        Write-PodeViewResponse -Path 'index' -Data @{ 'pokemon_sprite' = $pokemon_sprite }
    }
}

