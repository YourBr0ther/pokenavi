
# INITALIZATION
Clear-Host
$scriptLocation = "C:\Scripts\PokeNavi"
Set-Location -Path $scriptLocation

# FUNCTIONs
# Pull all default stats from PokeAPI
function Get-PokemonStats {

    param (
        [Parameter(Mandatory = $true)]
        [int]$id
    )

    $url = "https://pokeapi.co/api/v2/pokemon/$id"

    $response = Invoke-RestMethod -Uri $url -Method Get

    return $response

}

function Get-PokeDexEntries {

    param (
        [Parameter(Mandatory = $true)]
        [int]$id
    )

    $url = "https://pokeapi.co/api/v2/pokemon-species/$id"

    $response = Invoke-RestMethod -Uri $url -Method Get

    $flavortextArray = @()
    for ($i = 0; $i -le $response.flavor_text_entries.count; $i++) {
    
        if ($response.flavor_text_entries[$i].language.name -eq "en") {
            $flavorTextArray += ($response.flavor_text_entries[$i].flavor_text -replace "`r`n|`r|`n", " ").Trim()
        }
    
    
    }
    $flavorTextArray = $flavortextArray | Select-Object -Unique

    return $flavorTextArray

}

try {
    $pokemonExport = ".\Generate Pokemon\Sample PK3\MANKEY.pk3"
    if (Test-Path -Path $pokemonExport) { Write-Host "Pokemon exist. Importing now" } else { Write-Host "There was a problem importing the Pokemon" } 
    $pk3Data = [System.IO.File]::ReadAllBytes($pokemonExport)
    $pk3Data = $pk3Data[0..78]
    # Use the BitConverter class to convert the byte array to a hex string
    $hexString = [BitConverter]::ToString($pk3Data)

    # Remove the dashes (-) from the hex string
    $hexString = $hexString.Replace("-", "")

    # Display the hex string
    Write-Host $hexString
  
}
catch { break }

$stats = Get-PokemonStats -id $speciesIndex

$s = [ordered]@{

    NationalPokedexNumber  = $stats.id
    Species                = [System.Globalization.CultureInfo]::CurrentCulture.TextInfo.ToTitleCase($stats.species.name)
    Type1                  = [System.Globalization.CultureInfo]::CurrentCulture.TextInfo.ToTitleCase($stats.types.type.name)
    Type2                  = ""
    'HP Base'              = "$($stats.stats[0].base_stat)"
    'Attack Base'          = "$($stats.stats[1].base_stat)"
    'Defense Base'         = "$($stats.stats[2].base_stat)"
    'Special Attack Base'  = "$($stats.stats[3].base_stat)"
    'Special Defense Base' = "$($stats.stats[4].base_stat)"
    'Speed Base'           = "$($stats.stats[5].base_stat)"
    'Ability 1'            = $stats.abilities[0].ability.name
    'Ability 2'            = $stats.abilities[1].ability.name
}

$d = $pk3Data[31..81]

$moves = [ordered]@{

    "Move 1"    = "$(Get-MoveName -id $($d[$($aOffset+1)]))"
    "Move 2"    = "$(Get-MoveName -id $($d[$($aOffset+3)]))"
    "Move 3"    = "$(Get-MoveName -id $($d[$($aOffset+5)]))"
    "Move 4"    = "$(Get-MoveName -id $($d[$($aOffset+7)]))"
    "Move 1 PP" = "$($d[$($aOffset+9)])"
    "Move 2 PP" = "$($d[$($aOffset+10)])"
    "Move 3 PP" = "$($d[$($aOffset+11)])"
    "Move 4 PP" = "$($d[$($aOffset+12)])"
    
}
                
$growth = [ordered]@{
        
    "Species"    = "$($d[$($gOffset+0)..$($gOffset+1)])"
    "Item Held"  = "$($d[$($gOffset+2)..$($gOffset+3)])"
    "Experience" = "$([BitConverter]::ToUInt32($($d[$($gOffset+4)..$($gOffset+7)]), 0))"
    "PP Bonus"   = "$($d[$($gOffset+8)..$($gOffset+9)])"
    "Friendship" = "$($d[$($gOffset+10)])"
    "Unknown"    = "$($d[$($gOffset+11)..$($gOffset+12)])"
    
}
        
$EVs = [ordered]@{
    
    "HP EV"              = "$($d[$($eOffset+1)])"
    "Attack EV"          = "$($d[$($eOffset+2)])"
    "Defense EV"         = "$($d[$($eOffset+3)])"
    "Special Attack EV"  = "$($d[$($eOffset+4)])"
    "Special Defense EV" = "$($d[$($eOffset+5)])"
    "Speed EV"           = "$($d[$($eOffset+6)])"
    
}
        
$ivBytes = $d[$($mOffset + 5)..$($mOffset + 8)]
$ivValue = [BitConverter]::ToUInt32($ivBytes, 0)
$miscellaneous = [ordered]@{
        
    "Pokerus Status"     = "$($d[$($mOffset+1)])"
    "Met Location"       = "$($d[$($mOffset+2)])"
    "Origins Info"       = "$($d[$($mOffset+3)..$($mOffset+4)])"
    "Ribbon Data"        = "$($d[$($mOffset+9)..$($mOffset+12)])"
    "HP IV"              = "$($ivValue -band 0x1F)"
    "Attack IV"          = "$(($ivValue -shr 5) -band 0x1F)"
    "Defense IV"         = "$(($ivValue -shr 10) -band 0x1F)"
    "Speed IV"           = "$(($ivValue -shr 15) -band 0x1F)"
    "Special Attack IV"  = "$(($ivValue -shr 20) -band 0x1F)"
    "Special Defense IV" = "$(($ivValue -shr 25) -band 0x1F)"

}

$pokemon = ""
$pokemon = [PSCustomObject]@{
    NationalPokedexNumber = $s.NationalPokedexNumber
    Species               = $s.Species
    Type1                 = $s.Type1
    Type2                 = $s.Type2
    BaseStats             = @{
        HP             = $s.'HP Base'
        Attack         = $s.'Attack Base'
        Defense        = $s.'Defense Base'
        SpecialAttack  = $s.'Special Attack Base'
        SpecialDefense = $s.'Special Defense Base'
        Speed          = $s.'Speed Base'
    }
    Abilities             = @("$((Get-Culture).TextInfo.ToTitleCase($s.'Ability 1').Replace("-", " "))", "$(if (Get-HiddenAbility -PersonalityValue $PersonalityValue) { $((Get-Culture).TextInfo.ToTitleCase($s.'Ability 2').Replace("-", " "))})")
    Moves                 = @($moves."Move 1", $moves."Move 2", $moves."Move 3", $moves."Move 4")
    Level                 = $pk3Data[84]
    ExperiencePoints      = $growth.Experience
    IndividualValues      = @{
        HP             = $miscellaneous.'HP IV'
        Attack         = $miscellaneous.'Attack IV'
        Defense        = $miscellaneous.'Defense IV'
        SpecialAttack  = $miscellaneous.'Special Attack IV'
        SpecialDefense = $miscellaneous.'Special Defense IV'
        Speed          = $miscellaneous.'Speed IV'
    }
    EffortValues          = @{
        HP             = $EVs.'HP EV'
        Attack         = $EVs.'Attack EV'
        Defense        = $EVs.'Defense EV'
        SpecialAttack  = $EVs.'Special Attack EV'
        SpecialDefense = $EVs.'Special Defense EV'
        Speed          = $EVs.'Speed EV'
    }
    Nature                = Get-NatureName -id $($personalityValue % 25)
    HeldItem              = $heldItem
    Gender                = Get-PokemonGender -PersonalityValue $PersonalityValue
    OriginalTrainer       = @{
        Name      = (Get-Culture).TextInfo.ToTitleCase($trainerName.ToLower())
        TrainerID = $trainerId
        SecretID  = $secretId
    }
    Friendship            = $growth.Friendship
    Nickname              = (Get-Culture).TextInfo.ToTitleCase($nickname.ToLower())
    ShinyStatus           = $isShiny
    BallCaught            = $pokeball
    Ribbons               = $ribbons
    Markings              = Get-PokemonMarkings -markingsData $pk3Data[27]
    PersonalitySheet      = ""
    Raw                   = $pk3Data
}

$pokemonJson = $pokemon | ConvertTo-Json
# $outputFile = ".\JSON\$($pokemon.Species).json"

# [System.IO.File]::WriteAllText($outputFile, $pokemonJson, (New-Object System.Text.UTF8Encoding($false)))

