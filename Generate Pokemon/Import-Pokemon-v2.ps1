Clear-Host

# Variables
#$pokemonPath = ".\Generate Pokemon\Sample PK3\CHARMELEON.pk3"

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

    $natureList = ".\Generate Pokemon\Mappings\Natures.csv"
    $natureArray = Import-CSV -Path $natureList
    $PokemonIDDC = [System.Convert]::ToInt64($PokemonID, 16)
    $id = $($PokemonIDDC % 25)

    return $natureArray.Personality[$id]

}

function Get-Gender {
    param (
        [Parameter(Mandatory = $true)]
        [String]$PokemonID,
        [String]$PokemonSpecies
    )


    $PokemonIDDC = [System.Convert]::ToInt64($PokemonID, 16)
    $apiUrl = "https://pokeapi.co/api/v2/gender/female"
    $response = Invoke-RestMethod -Uri $apiUrl

    $allFemalePokemon = $response.pokemon_species_details
    for ($i = 0; $i -le $allFemalePokemon.count; $i++) { if ($PokemonSpecies -eq $($response.pokemon_species_details[$i].pokemon_species.name)) { $FemaleRatio = $($response.pokemon_species_details[$i].rate / 8); break } }

    # Get last 2 digits of PID in decimal form
    $decimalValue = $PokemonIDDC % 256

    # Define gender thresholds
    $genderThresholds = @{
        '12.5%' = 30
        '25%'   = 63
        '50%'   = 126
        '75%'   = 190
    }

    # Determine gender threshold based on female ratio
    $genderThreshold = $null
    switch ($FemaleRatio) {
        0.125 { $genderThreshold = $genderThresholds['12.5%'] }
        0.25 { $genderThreshold = $genderThresholds['25%'] }
        0.5 { $genderThreshold = $genderThresholds['50%'] }
        0.75 { $genderThreshold = $genderThresholds['75%'] }
        default {
            throw "Invalid female ratio specified. Please use a valid value: 0.125, 0.25, 0.5, or 0.75."
        }
    }

    if ($decimalValue -le $genderThreshold) {
        return "Female"
    }
    else {
        return "Male"
    }

}

function Get-ABCDOrder {
    param (
        [Parameter(Mandatory = $true)]
        [String]$PokemonID
    )

    $ABCDList = ".\Generate Pokemon\Mappings\ABCD-Structure.csv"
    $ABCDArray = Import-CSV -Path $ABCDList

    $PokemonIDDC = [System.Convert]::ToInt64($PokemonID, 16)

    $order = [Math]::Floor($PokemonIDDC % 24)

    return $ABCDArray.Permutation[$order]

}

function Get-TrainerID([Byte[]] $bytes) {
    return ([UInt32] ($bytes[0] -bor ($bytes[1] -shl 8) -bor ($bytes[2] -shl 16) -bor ($bytes[3] -shl 24))) -band 0xFFFF

}

$pokemonHEX = "9de847ffe1dd6e3bbdbbcdbdc9c9c8ff80430202c5d9e2ffffff00a4f100007c3529c47c3529c47c3529c4593429c4013529c47c7329c47c0eace45875f8c97c3529c4163529c47c3529c4623529c4"
$pk3Data = [byte[]]::new($pokemonHEX.Length / 2)
for ($i = 0; $i -lt $pokemonHEX.Length; $i += 2) {
    $pk3Data[$i / 2] = [convert]::ToByte($pokemonHEX.Substring($i, 2), 16)
}

$reversePokemonID = $pokemonHEX[0..7] -join ""
$pokemonID = $pk3Data[3..0]
$normalPokemonID = ($pokemonID | ForEach-Object { $_.ToString("X2") }) -join ""
$reverseTrainerID = Get-TrainerID $pk3Data[4..7]
$TrainerID = Get-TrainerID $pk3Data[7..4]

$nature = Get-Nature -PokemonID $normalPokemonID
#$gender = Get-Gender -PokemonID $normalPokemonID
$ABCDOrder = Get-ABCDOrder -PokemonID $normalPokemonID

Write-Host "PokemonHEX: $pokemonHEX"
Write-Host "PokemonID - [R]: $reversePokemonId"
Write-Host "PokemonID - [N]: $normalPokemonId"
Write-Host "Nature: $nature"
#Write-Host "Gender: $gender"
Write-Host "ABCD Order: $ABCDOrder"
Write-Host "TrainerID - [R]: $reverseOTrainerID" 
Write-Host "TrainerID - [N]: $TrainerID" 

