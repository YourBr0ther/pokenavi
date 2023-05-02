
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

# Get the Substructure Order
function Get-PK3SubstructureOrder {
    param (
        [Parameter(Mandatory = $true)]
        [uint32]$PersonalityValue
    )

    $order = ($PersonalityValue % 6) - 1
    $permutations = @(
        "GAEM", "GAME", "GEAM", "GEMA", "GMAE", "GMEA",
        "AGEM", "AGME", "AEGM", "AEMG", "AMGE", "AMEG",
        "EGAM", "EGMA", "EAGM", "EAMG", "EMGA", "EMAG",
        "MGAE", "MGEA", "MAGE", "MAEG", "MEGA", "MEAG"
    )

    return $permutations[$order]
}

function Get-MoveName {
    param (
        [Parameter(Mandatory = $true)]
        [int]$id
    )

    if (!($id -eq 0)) {
        Write-Host "Move ID: $id"

        # Set the API endpoint URL for the move with ID 1 (Pound)
        $url = "https://pokeapi.co/api/v2/move/$id"

        # Make a GET request to the API endpoint and store the response
        $response = Invoke-RestMethod -Uri $url -Method Get

        # Extract the move name from the response
        $moveName = [System.Globalization.CultureInfo]::CurrentCulture.TextInfo.ToTitleCase($response.name.Replace("-", " "))

        return $moveName
    }
    else {
        return ""
    }
}

function Get-HiddenAbility {
    param (
        [Parameter(Mandatory = $true)]
        [int]$PersonalityValue
    )

    $binary = [System.Convert]::ToString($PersonalityValue, 2)
    $lastDigit = $binary[-1]

    if ($lastDigit -eq 1 ) { return $true } else { return $false }

}

function Get-NatureName {
    param (
        [Parameter(Mandatory = $true)]
        [int]$id
    )

    # Set the API endpoint URL for the nature with ID 1 (Hardy)
    $url = "https://pokeapi.co/api/v2/nature/$id"

    # Make a GET request to the API endpoint and store the response
    $response = Invoke-RestMethod -Uri $url -Method Get

    # Extract the nature name from the response
    $nature_name = [System.Globalization.CultureInfo]::CurrentCulture.TextInfo.ToTitleCase($response.name.Replace("-", " "))

    return $nature_name

}

function Get-ShinyValue {
    param (
        [int]$TID,
        [int]$SID,
        [int64]$PV
    )

    # Split the Personality Value into two 16-bit values
    $PV_High = ($PV -shr 16) -band 0xFFFF
    $PV_Low = $PV -band 0xFFFF

    # Calculate the shiny value
    $XOR = ($TID -bxor $SID) -bxor ($PV_High -bxor $PV_Low)
    $SV = $XOR -shr 3

    return $SV
}

function Get-HeldItem {
    param (
        [string]$heldItemIndex
    )

    write-Host "Held Item Index: $heldItemIndex"

    if (!($heldItemIndex -eq 0)) {
        $apiUrl = "https://pokeapi.co/api/v2/item/$heldItemIndex"
        $response = Invoke-RestMethod -Uri $apiUrl

        return $((Get-Culture).TextInfo.ToTitleCase($response.name).Replace("-", " "))
    }
    else {
        return ""
    }

}

function Get-PokemonGender {
    param (
        [Parameter(Mandatory = $true)]
        [int]$PersonalityValue
    )

    $apiUrl = "https://pokeapi.co/api/v2/gender/female"
    $response = Invoke-RestMethod -Uri $apiUrl

    $allFemalePokemon = $response.pokemon_species_details
    for ($i = 0; $i -le $allFemalePokemon.count; $i++) {

        if ($($s.Species) -eq $($response.pokemon_species_details[$i].pokemon_species.name)) { $FemaleRatio = $($response.pokemon_species_details[$i].rate / 8); break }

    }

    # Get last 2 digits of PID in decimal form
    $decimalValue = $PersonalityValue % 256

    Write-Host $decimalValue

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

function Get-Pokeball {
    param (
        [int]$originsByte
    )

    $pokeballIndex = ($originsByte -band 0x7800) -shr 11

    switch ($pokeballIndex) {
        0 { return "Poke Ball" }
        1 { return "Great Ball" }
        2 { return "Ultra Ball" }
        3 { return "Master Ball" }
        4 { return "Safari Ball" }
        5 { return "Level Ball" }
        6 { return "Lure Ball" }
        7 { return "Moon Ball" }
        8 { return "Friend Ball" }
        9 { return "Love Ball" }
        10 { return "Heavy Ball" }
        11 { return "Fast Ball" }
        12 { return "Sport Ball" }
        13 { return "Premier Ball" }
        default { return "Unknown" }
    }
}

function Get-PokemonMarkings {
    param (
        [int]$markingsData
    )

    # Define an array of markings
    $markings = @("Circle", "Square", "Triangle", "Heart")

    # Create an empty array to store the markings for the current Pokemon
    $pokemonMarkings = @()

    # Iterate through each marking
    for ($i = 0; $i -lt $markings.Length; $i++) {
        # Check if the current bit is set in the markings data
        if ($markingsData -band (1 -shl $i)) {
            # If the bit is set, add the marking to the array of Pokemon markings
            $pokemonMarkings += $markings[$i]
        }
    }

    # Return the array of Pokemon markings
    return $pokemonMarkings
}

function Get-PokemonRibbons {
    param (
        [int]$ribbonData
    )

    # Define an array of ribbons
    $ribbons = @("Cool", "Beauty", "Cute", "Smart", "Tough", "Champion", "Winning", "Victory", "Artist", "Effort", "Battle Champion", "Regional Champion", "National Champion", "Country", "National", "Earth", "World")

    # Create an empty array to store the ribbons for the current Pokemon
    $pokemonRibbons = @()

    # Iterate through each ribbon
    for ($i = 0; $i -lt $ribbons.Length; $i++) {
        # Check if the current bit is set in the ribbon data
        if ($ribbonData -band (1 -shl $i)) {
            # If the bit is set, add the ribbon to the array of Pokemon ribbons
            $pokemonRibbons += $ribbons[$i]
        }
    }

    # Return the array of Pokemon ribbons
    return $pokemonRibbons
}

function Get-PokemonMBTI {
    param (
        [string]$JsonFilePath
    )

    $jsonData = Get-Content -Path $JsonFilePath | ConvertFrom-Json

    $Type1 = $jsonData.Type1
    $Type2 = $jsonData.Type2
    $BaseStats = $jsonData.BaseStats
    $IndividualValues = $jsonData.IndividualValues
    $EffortValues = $jsonData.EffortValues
    $Nature = $jsonData.Nature

    # You can adjust these rules for determining MBTI type based on the key attributes
    $Extrovert = $BaseStats.Speed -gt 50 -and $EffortValues.Speed -gt 10
    $Intuitive = $Type1 -eq "Psychic" -or $Type2 -eq "Psychic"
    $Thinking = $BaseStats.Attack -gt $BaseStats.Defense -and $IndividualValues.Attack -gt $IndividualValues.Defense
    $Perceiving = $Nature -ne "Hardy"

    $MBTI = ""
    if ($Extrovert) { $MBTI += "E" } else { $MBTI += "I" }
    if ($Intuitive) { $MBTI += "N" } else { $MBTI += "S" }
    if ($Thinking) { $MBTI += "T" } else { $MBTI += "F" }
    if ($Perceiving) { $MBTI += "P" } else { $MBTI += "J" }

    return $MBTI
}

function Get-PokemonMBTI {
    param (
        [PSCustomObject]$pokemon
    )

    $Type1 = $pokemon.Type1
    $Type2 = $pokemon.Type2
    $BaseStats = $pokemon.BaseStats
    $IndividualValues = $pokemon.IndividualValues
    $EffortValues = $pokemon.EffortValues
    $Nature = $pokemon.Nature

    # You can adjust these rules for determining MBTI type based on the key attributes
    $Extrovert = $BaseStats.Speed -gt 50 -and $EffortValues.Speed -gt 10
    $Intuitive = $Type1 -eq "Psychic" -or $Type2 -eq "Psychic"
    $Thinking = $BaseStats.Attack -gt $BaseStats.Defense -and $IndividualValues.Attack -gt $IndividualValues.Defense
    $Perceiving = $Nature -ne "Hardy"

    $MBTI = ""
    if ($Extrovert) { $MBTI += "E" } else { $MBTI += "I" }
    if ($Intuitive) { $MBTI += "N" } else { $MBTI += "S" }
    if ($Thinking) { $MBTI += "T" } else { $MBTI += "F" }
    if ($Perceiving) { $MBTI += "P" } else { $MBTI += "J" }

    return $MBTI
}

# function Get-PersonalitySheet {
#     param (
#         [Parameter(Mandatory = $true)]
#         [PSCustomObject]$pokemon,
#         [string]$MBTIType
#     )

#     $content = Get-Content -path ".\Generate Pokemon\PersonalitySheet-Template.txt" -Raw

#     $replacements = @(
#         @{OldValue = '$nickname'; NewValue = $pokemon.Nickname },
#         @{OldValue = '$species'; NewValue = $pokemon.Species },
#         @{OldValue = '$trainerName'; NewValue = $pokemon.OriginalTrainer.Name },
#         @{OldValue = '$level'; NewValue = $pokemon.Level },
#         @{OldValue = '$gender'; NewValue = $pokemon.Gender },
#         @{OldValue = '$pokedexEntries'; NewValue = Get-PokeDexEntries -id $pokemon.NationalPokedexNumber },
#         @{OldValue = '$nature'; NewValue = $pokemon.Nature },
#         @{OldValue = '$type1'; NewValue = $pokemon.Type1 },
#         @{OldValue = '$type2'; NewValue = $(if ($pokemon.Type2) { $pokemon.Type2 } else { "" }) },
#         @{OldValue = '$helditem'; NewValue = 'Item1' },
#         @{OldValue = '$hobby'; NewValue = 'Hobby1' },
#         @{OldValue = '$MBTI'; NewValue = $PokemonMBTI },
#         @{OldValue = '$marking1'; NewValue = 'Marking1' },
#         @{OldValue = '$marking2'; NewValue = 'Marking2' },
#         @{OldValue = '$marking3'; NewValue = 'Marking3' },
#         @{OldValue = '$marking4'; NewValue = 'Marking4' }
#     )

#     foreach ($replacement in $replacements) {
#         $content = $content -replace [regex]::Escape($replacement.OldValue), $replacement.NewValue
#     }

#     return $content
    

# }

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

function Floor([double]$number) {
    [Math]::Floor($number)
}

# START SCRIPT BODY

$ShinyValue = Get-ShinyValue -TID $TrainerID -SID $SecretID -PV $PersonalityValue
if ($ShinyValue -le 7) { $isShiny = $true } else { $isShiny = $false }


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

# Get all of the "normalize values from Pokemon API"
$speciesIndex = [BitConverter]::ToUInt16($pk3Data, 32)

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

$tempNickname = $pk3Data[8..17]
$decNickname = [System.Convert]::ToInt64($tempNickname, 16)

$tempTrainerName = $pk3Data[20..26]

$gen3CharacterMap = Import-CSV -Path ".\Generate Pokemon\Mappings\gen3CharMap.csv"

$nickname = ""
foreach ($nicknameLetter in $tempNickname) {
    $nickname += $gen3CharacterMap.Character[$nicknameLetter]
}
$nickname = [cultureinfo]::GetCultureInfo("en-US").TextInfo.ToTitleCase($nickname)

$trainerName = ""
foreach ($trainerLetter in $tempTrainerName) {
    $trainerName += $gen3CharacterMap.Character[$trainerLetter]
}
$trainerName = [cultureinfo]::GetCultureInfo("en-US").TextInfo.ToTitleCase($trainerName)

$personalityValue = [BitConverter]::ToUInt32($($pk3Data[0..3]), 0)
$substructureOrder = Get-PK3SubstructureOrder -PersonalityValue $personalityValue
$pokemonID = $pk3Data[3..0]

# Convert the byte array to an integer
$intValue = [BitConverter]::ToUInt32($pokemonID, 0)
$ABCDIndex = [Math]::Floor($intValue % 24)
$ABCDOrder = Get-PK3SubstructureOrder -PersonalityValue $ABCDIndex

Write-Host "PV: $personalityValue"
Write-Host "New Substructure Order: $ABCDOrder"
Write-Host "Old Substructure Order: $substructureOrder"

$d = $pk3Data[31..81]

$i = 0
foreach ($letter in [char[]]$substructureOrder) {

    if ($letter -eq "G") { $gOffset = $i }
    if ($letter -eq "A") { $aOffset = $i }
    if ($letter -eq "E") { $eOffset = $i }
    if ($letter -eq "M") { $mOffset = $i }

    $i += 12
}

Write-Host "Growth Offset: $gOffset"
Write-Host "Attack Offset: $aOffset"
Write-Host "EVs Offset: $eOffset"
Write-Host "Misc Offset: $mOffset"
Write-Host ""

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

$ribbons = Get-PokemonRibbons -ribbonData $([BitConverter]::ToUInt32($($d[$($mOffset + 9)..$($mOffset + 12)]), 0))

$heldItem = Get-HeldItem -heldItemIndex $($growth.'Item Held'[2])

function BytesToId([Byte[]]$bytes) {
    $dword = [BitConverter]::ToUInt32($bytes, 0)
    return $dword -band 0xFFFF
}

Write-Host $pk3Data[4..7]

$trainerId = BytesToId $pk3Data[4..7]

function BytesToId([Byte[]]$bytes) {
    $dword = [BitConverter]::ToUInt32($bytes, 0)
    return $dword -shr 16
}

$secretId = BytesToId $pk3Data[4..7]

$pokeball = Get-Pokeball -originsByte "$($miscellaneous.'Origins Info'[3])$($miscellaneous.'Origins Info'[3])"

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

#$PokemonMBTI = Get-PokemonMBTI -pokemon $pokemon

#$personalitySheet = Get-PersonalitySheet -pokemon $pokemon -MBTIType $PokemonMBTI
#$pokemon.PersonalitySheet = $personalitySheet

$pokemonJson = $pokemon | ConvertTo-Json
# $outputFile = ".\JSON\$($pokemon.Species).json"

# [System.IO.File]::WriteAllText($outputFile, $pokemonJson, (New-Object System.Text.UTF8Encoding($false)))

