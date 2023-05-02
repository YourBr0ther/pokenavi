Clear-Host

# Variables
#$pokemonPath = ".\Generate Pokemon\Sample PK3\CHARMELEON.pk3"
$Mappings = ".\Generate Pokemon\Mappings"

function Get-PokemonBytes {
    param (
        [Parameter(Mandatory = $true)]
        [String]
        $Path
    )
    $pk3Data = $([System.IO.File]::ReadAllBytes($pokemonExport))[0..78]
    return $pk3Data
}

function Get-Nature {
    param (
        [Parameter(Mandatory = $true)]
        [String]$PokemonID
    )

    $natureList = "$Mappings\Natures.csv"
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
    $decimalValue = $PokemonIDDC % 256
    $genderThresholds = @{
        '12.5%' = 30
        '25%'   = 63
        '50%'   = 126
        '75%'   = 190
    }

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

    $ABCDList = "$Mappings\ABCD-Structure.csv"
    $ABCDArray = Import-CSV -Path $ABCDList

    $PokemonIDDC = [System.Convert]::ToInt64($PokemonID, 16)

    $order = [Math]::Floor($PokemonIDDC % 24)

    return $ABCDArray.Permutation[$order]

}

function Get-TrainerID([Byte[]]$bytes) {
    $dword = [BitConverter]::ToUInt32($bytes, 0)
    return $dword -band 0xFFFF
}

function Get-SecretTrainerID([Byte[]]$bytes) {
    $dword = [BitConverter]::ToUInt32($bytes, 0)
    return $dword -shr 16
}

$pokemonHEX = "9DE847FFE1DD6E3BBDBBCDBDC9C9C8FF80430202C5D9E2FFFFFF00A4F100007C3529C47C3529C47C3529C4593429C4013529C47C7329C47C0EACE45875F8C97C3529C4163529C47C3529C4623529C4"
#$pokemonHEX = "8F11F92D198BF0A6CAE9E2D7DCEDFF0807000202BDC2CCC3CDFFFF00370700003800000084010000006500000A002B0043000000231E1400000001000000000000000000007A042247A8803D000000"
$pk3Data = [byte[]]::new($pokemonHEX.Length / 2)
for ($i = 0; $i -lt $pokemonHEX.Length; $i += 2) {
    $pk3Data[$i / 2] = [convert]::ToByte($pokemonHEX.Substring($i, 2), 16)
}

$reversePokemonID = $pokemonHEX[0..7] -join ""
$pokemonID = $pk3Data[3..0]
$normalPokemonID = ($pokemonID | ForEach-Object { $_.ToString("X2") }) -join ""
$TrainerID = Get-TrainerID $pk3Data[4..7]
$secretTrainerID = Get-SecretTrainerID $pk3Data[4..7]

Write-Host $pk3Data[4..7]

$nature = Get-Nature -PokemonID $normalPokemonID
#$gender = Get-Gender -PokemonID $normalPokemonID
$ABCDOrder = Get-ABCDOrder -PokemonID $normalPokemonID

Write-Host "PokemonHEX: $pokemonHEX"
Write-Host "PokemonID - [R]: $reversePokemonID"
Write-Host "PokemonID - [N]: $normalPokemonID"
Write-Host "Nature: $nature"
#Write-Host "Gender: $gender"
Write-Host "ABCD Order: $ABCDOrder"
Write-Host "TrainerID - [N]: $TrainerID" 
Write-Host "Seceret TrainerID - [N]: $secretTrainerID"

