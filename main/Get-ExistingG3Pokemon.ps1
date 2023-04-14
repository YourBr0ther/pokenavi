
# INITALIZATION
Clear-Host
$scriptLocation = "C:\Scripts\PokeNavi"
Set-Location -Path $scriptLocation

# Create proper name casing
$culture = [System.Globalization.CultureInfo]::CurrentCulture

# FUNCTIONs
function New-Pokemon {
    
    $pokemon = [PSCustomObject]@{
        NationalPokedexNumber = 
        Species = ''
        Type1 = ''
        Type2 = $null
        BaseStats = @{
            HP = 0
            Attack = 0
            Defense = 0
            SpecialAttack = 0
            SpecialDefense = 0
            Speed = 0
        }
        Abilities = @('', '')
        Moves = @('', '', '', '')
        Level = 0
        ExperiencePoints = 0
        IndividualValues = @{
            HP = 0
            Attack = 0
            Defense = 0
            SpecialAttack = 0
            SpecialDefense = 0
            Speed = 0
        }
        EffortValues = @{
            HP = 0
            Attack = 0
            Defense = 0
            SpecialAttack = 0
            SpecialDefense = 0
            Speed = 0
        }
        Nature = ''
        HeldItem = ''
        Gender = ''
        OriginalTrainer = @{
            Name = ''
            TrainerID = 0
            SecretID = 0
        }
        Friendship = 0
        Nickname = ''
        ShinyStatus = $false
        BallCaught = ''
        Ribbons = @('', '')
        Markings = @('', '')
    }

    return $pokemon
}

function Get-PokemonStats {

    param (
        [Parameter(Mandatory=$true)]
        [int]$id
    )

    $url = "https://pokeapi.co/api/v2/pokemon/$id"

    $response = Invoke-RestMethod -Uri $url -Method Get

    return $response

}


# START SCRIPT BODY
try {
    $pokemonExport = ".\testing\Char.pk3"
    if (Test-Path -Path $pokemonExport) { Write-Host "Pokemon exist. Importing now" } else { Write-Host "There was a problem importing the Pokemon" } 
    $pk3Data = [System.IO.File]::ReadAllBytes($pokemonExport)
}
catch { break }

# Get all of the "normalize values from Pokemon API"
$speciesIndex = [BitConverter]::ToUInt16($pk3Data, 32)

$stats = Get-PokemonStats -id $speciesIndex

$importableStats = [ordered]@{

    NationalPokedexNumber = $stats.id
    Species = $culture.TextInfo.ToTitleCase($stats.species.name)
    Type1 = $stats.types.type.name
    Type2 = ""

}

$importableStats

