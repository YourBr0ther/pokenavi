
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
    Write-Host $order
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

    # Set the API endpoint URL for the move with ID 1 (Pound)
    $url = "https://pokeapi.co/api/v2/move/$id"

    # Make a GET request to the API endpoint and store the response
    $response = Invoke-RestMethod -Uri $url -Method Get

    # Extract the move name from the response
    $moveName = [System.Globalization.CultureInfo]::CurrentCulture.TextInfo.ToTitleCase($response.name.Replace("-", " "))

    return $moveName
}

function Get-HiddenAbility {
    param (
        [Parameter(Mandatory = $true)]
        [int]$PersonalityValue
    )

    $binary = [System.Convert]::ToString($PersonalityValue, 2)
    $lastDigit = $binary[-1]

    if ($lastDigit -eq 1 ) { return $true} else {return $false}

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

$ShinyValue = Get-ShinyValue -TID $TrainerID -SID $SecretID -PV $PersonalityValue
if ($ShinyValue -le 7) { $isShiny = $true } else { $isShiny = $false }


function Get-HeldItem {
    param (
        [string]$heldItemIndex
    )

    Write-Host $heldItemIndex

    $apiUrl = "https://pokeapi.co/api/v2/item/$heldItemIndex"
    $response = Invoke-RestMethod -Uri $apiUrl

    Write-Host $response

    return $((Get-Culture).TextInfo.ToTitleCase($response.name).Replace("-", " "))

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

        if ($($s.Species) -eq $($response.pokemon_species_details[$i].pokemon_species.name)) {$FemaleRatio = $($response.pokemon_species_details[$i].rate/8); break}

    }

    # Get last 2 digits of PID in decimal form
    $decimalValue = $PersonalityValue % 256

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
        0.25  { $genderThreshold = $genderThresholds['25%'] }
        0.5   { $genderThreshold = $genderThresholds['50%'] }
        0.75  { $genderThreshold = $genderThresholds['75%'] }
        default {
            throw "Invalid female ratio specified. Please use a valid value: 0.125, 0.25, 0.5, or 0.75."
        }
    }

    if ($decimalValue -le $genderThreshold) {
        return "Female"
    } else {
        return "Male"
    }
    
}

# START SCRIPT BODY
try {
    $pokemonExport = ".\testing\CHARMELEON.pk3"
    if (Test-Path -Path $pokemonExport) { Write-Host "Pokemon exist. Importing now" } else { Write-Host "There was a problem importing the Pokemon" } 
    $pk3Data = [System.IO.File]::ReadAllBytes($pokemonExport)
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
    'Ability 1' = $stats.abilities[0].ability.name
    'Ability 2' = $stats.abilities[1].ability.name
}

$tempNickname = $pk3Data[8..17]
$tempTrainerName = $pk3Data[20..26]

$gen3CharacterMap = Import-CSV -Path ".\main\gen3CharMap.csv"

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

Write-Host "PV: $personalityValue"
Write-Host "Substructure Order: $substructureOrder"

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
    "Move 3"    = "$(Get-MoveName -id $($d[$($aOffset+5)])) "
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
    "HP IV"              = "$($ivValue -band 0x1F)"
    "Attack IV"          = "$(($ivValue -shr 5) -band 0x1F)"
    "Defense IV"         = "$(($ivValue -shr 10) -band 0x1F)"
    "Speed IV"           = "$(($ivValue -shr 15) -band 0x1F)"
    "Special Attack IV"  = "$(($ivValue -shr 20) -band 0x1F)"
    "Special Defense IV" = "$(($ivValue -shr 25) -band 0x1F)"

}

$heldItem = Get-HeldItem -heldItemIndex $($growth.'Item Held'[2])

function BytesToId([Byte[]]$bytes) {
    $dword = [BitConverter]::ToUInt32($bytes, 0)
    return $dword -band 0xFFFF
}

$trainerId = BytesToId $pk3Data[4..7]

function BytesToId([Byte[]]$bytes) {
    $dword = [BitConverter]::ToUInt32($bytes, 0)
    return $dword -shr 16
}

$secretId = BytesToId $pk3Data[4..7]

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
    BallCaught            = ''
    Ribbons               = @('', '')
    Markings              = @('', '')
    Raw                   = $pk3Data
}

$pokemon | ConvertTo-Json | Out-File -FilePath ".\$($pokemon.Species).json"