Clear-Host

# Variables
$pokemonPath = ".\Generate Pokemon\Sample PK3\CHARMELEON.pk3"

function Get-PokemonBytes {
    param (
        [Parameter(Mandatory = $true)]
        [String]
        $Path
    )
    
    Write-Host "Import Location: $Path"
    $pk3Data = $([System.IO.File]::ReadAllBytes($pokemonExport))[0..78]

    return $pk3Data
}

function Get-Nature {
    param (
        [Parameter(Mandatory = $true)]
        [String]$PokemonID
    )

    Write-Host "Pokemon ID: $PokemonID"
    $PokemonIDDC = $(([System.Convert]::ToInt64($PokemonID, 16)))
    Write-Host "Pokemon ID DEC: $PokemonIDDC"
    $id = $PokemonIDDC % 25

    Write-Host "Nature ID: $id"

    # Set the API endpoint URL for the nature with ID 1 (Hardy)
    $url = "https://pokeapi.co/api/v2/nature/$id"

    # Make a GET request to the API endpoint and store the response
    $response = Invoke-RestMethod -Uri $url -Method Get

    # Extract the nature name from the response
    $nature_name = [System.Globalization.CultureInfo]::CurrentCulture.TextInfo.ToTitleCase($response.name.Replace("-", " "))

    return $nature_name

}

$pokemonHEX = "9de847ffe1dd6e3bbdbbcdbdc9c9c8ff80430202c5d9e2ffffff00a4f100007c3529c47c3529c47c3529c4593429c4013529c47c7329c47c0eace45875f8c97c3529c4163529c47c3529c4623529c4"

#$pokemonByteArray = Get-PokemonBytes -Path $pokemonPath
#$pokemonHEX = $([BitConverter]::ToString($pk3Data)).Replace("-", "")

# Reverse Pokemon ID aka Personality Value [HEX]
$reversePokemonID = $pokemonHEX[0..7] -join ""
# Pokemon ID [HEX]
$normalPokemonID = $pokemonHEX[7..0] -join ""

$nature = Get-Nature -PokemonID $normalPokemonID

Write-Host "PokemonHEX: $pokemonHEX"
Write-Host "PokemonID - [R]: $reversePokemonId"
Write-Host "PokemonID - [N]: $normalPokemonId"
Write-Host "Nature: $nature"