Clear-Host

# Variables
$pokemonPath = ".\Generate Pokemon\Sample PK3\005 - CHARMELEON - D97425D07CE5.ek3"
$Mappings = ".\Generate Pokemon\Mappings"

function Get-PokemonBytes {
    param (
        [Parameter(Mandatory = $true)]
        [String]
        $Path
    )
    $pk3Data = $([System.IO.File]::ReadAllBytes($Path))[0..79]
    return $pk3Data
}

function Get-Nature {
    param (
        [Parameter(Mandatory = $true)]
        [String]$PokemonID
    )
    $natureList = "$Mappings\natures.csv"
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
    $regionalDex = "https://pokeapi.co/api/v2/pokedex/2/"
    $responseDex = Invoke-RestMethod -Uri $regionalDex
    $PokemonSpeciesName = $responseDex.pokemon_entries.pokemon_species[$PokemonSpecies - 1].Name
    
    $PokemonIDDC = [System.Convert]::ToInt64($PokemonID, 16)
    $apiUrl = "https://pokeapi.co/api/v2/gender/female"
    $response = Invoke-RestMethod -Uri $apiUrl
    $allFemalePokemon = $response.pokemon_species_details
    for ($i = 0; $i -le $allFemalePokemon.count; $i++) { if ($PokemonSpeciesName -eq $($response.pokemon_species_details[$i].pokemon_species.name)) { $FemaleRatio = $($response.pokemon_species_details[$i].rate / 8); break } }
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
        default {        }
    }
    if ($decimalValue -le $genderThreshold) { return "Female" } else { return "Male" }
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

function Get-DecryptionKey {
    param (
        [Parameter(Mandatory = $true)]
        [String]$TrainerIDHex,
        [String]$PokemonIDHex
    )
    $trainerIDInt = [Convert]::ToUInt32($TrainerIDHex, 16)
    $pokemonIDInt = [Convert]::ToUInt32($PokemonIDHex, 16)
    $signedResult = $pokemonIDInt -bxor $trainerIDInt
    $bytes = [BitConverter]::GetBytes($signedResult)
    $result = [BitConverter]::ToUInt32($bytes, 0)
    return $result
}

function Get-ShinyStatus {
    param (
        [decimal]$decryptionKey
    )
    $XResult = ($decryptionKey / 65536) -bxor ($decryptionKey % 65536)
    if ($XResult -gt 8) { return $false } else { return $true }
}

function Get-Name {
    param (
        [Byte[]]$nameBytes
    )
    $characterList = "$Mappings\charMap.csv"
    $csvData = Import-Csv -Path $characterList -Delimiter ',' -Header Key, Value
    $characterArray = @{}
    foreach ($row in $csvData) {
        $characterArray[$row.Key] = $row.Value
    }
    $nameHex = ($nameBytes | ForEach-Object { $_.ToString("X2") }) -join ""
    $name = ""
    for ($i = 0; $i -lt $nameHex.length; $i += 2) {
        
        $letter = $nameHex[$i] + $nameHex[$i + 1]  
        if ($letter -eq "FF") { break } else { $name += $characterArray[$letter] } 
    }
    return $name
}

function Get-Markings([int]$byte27) {
    $marks = @{
        "Circle"   = [Convert]::ToUInt32("0001", 2)
        "Square"   = [Convert]::ToUInt32("0010", 2)
        "Triangle" = [Convert]::ToUInt32("0100", 2)
        "Heart"    = [Convert]::ToUInt32("1000", 2)
    }

    $combinedMarks = @()
    foreach ($mark in $marks.Keys) {
        if (($marks[$mark] -band $byte27) -eq $marks[$mark]) {
            $combinedMarks += $mark
        }
    }
    if (!$combinedMarks) { return "No Markings" } else { return $combinedMarks }
}

function Get-abcdDATA ([string]$ABCDOrder) {
    for ($h = 0; $h -le 4; $h++) {
        $dataStructure = ""

        for ($i = 32; $i -le 79; $i += 12) {
            $blocks = @()
            $reversedBlocks = @()
            $decryptedBlocks = @()
    
            for ($j = 0; $j -lt 3; $j++) {
                $block = ""
                $reversedBlock = ""
                for ($k = 0; $k -lt 4; $k++) {
                    $block += $pk3Data[$i + $j * 4 + $k].ToString("X2")
                    $reversedBlock += $pk3Data[$i + $j * 4 + 3 - $k].ToString("X2")
                }
                $blocks += $block
                $reversedBlocks += $reversedBlock
                $decryptedBlock = [Convert]::ToString(([Convert]::ToUInt32($reversedBlock, 16) -bxor [Convert]::ToUInt32($hexOXR, 16)), 16)
                $decryptedBlocks += $decryptedBlock.PadLeft(8, '0')

            }

            $dataStructure += $decryptedBlocks
        }
    }
    $dataStructure = $dataStructure.Replace(" ", "")
    $tempDataArray = @{
        A = $dataStructure[0..23] -join ""
        B = $dataStructure[24..47] -join ""
        C = $dataStructure[48..71] -join ""
        D = $dataStructure[72..96] -join ""
    }
    foreach ($letter in [char[]]$ABCDOrder) {

        switch ($letter) {
            "A" { $tempEVs = $tempDataArray."$letter"; break }
            "B" { $tempGrowth = $tempDataArray."$letter"; break }
            "C" { $tempMisc = $tempDataArray."$letter"; break }            
            "D" { $tempMoves = $tempDataArray."$letter"; break }
        }  
    }
    $DataArray = @{
        "Growth" = $tempGrowth
        "Moves"  = $tempMoves
        "EVs"    = $tempEVs
        "Misc"   = $tempMisc
    }   
    return $DataArray
}


function Get-HeldItem ([string[]]$heldItem) {
    $heldItemList = "$Mappings\heldItems.csv"
    $heldItemsArray = Import-Csv -Path $heldItemList
    $hex1 = [Convert]::ToUInt32($heldItem -join "", 16)
    $hex2 = [Convert]::ToUInt32("10000", 16)
    $result = $hex1 / $hex2
    $hexResult = [Convert]::ToString($result, 16)
    $heldItem = $heldItemsArray[$hexResult].Item
    return $heldItem
}

function Get-PokemonSpecies ([string[]]$localDexNumber) { return [Convert]::ToUInt32($localDexNumber -join "", 16) }

function Get-PokemonSpeciesName([int]$PokemonSpecies) { 

    $regionalDex = "https://pokeapi.co/api/v2/pokedex/2/"
    $responseDex = Invoke-RestMethod -Uri $regionalDex
    $url = $responseDex.pokemon_entries.pokemon_species[$PokemonSpecies - 1].url
    $regex = '/(\d+)/'
    $match = [regex]::Match($url, $regex)
    $name = $responseDex.pokemon_entries.pokemon_species[$PokemonSpecies - 1].name
    $number = $match.Groups[1].Value
    $dexInformation = @{
        'Species' = $name
        'Number'  = $number
    }
    return $dexInformation
}

function Get-Exp ([string[]]$expHex) { return [Convert]::ToUInt32($expHex -join "", 16) }

function Get-Happiness ([string[]]$happinessHex) { return $(([Convert]::ToUInt32($happinessHex -join "", 16) / 256) % 256 ) }

function Get-Moves ([string[]]$movesHex) {

    $moveList = "$Mappings\moves.csv"
    $moveArray = Import-CSV -Path $moveList
    $moveIDs = @{
        "Move 1" = $moveArray[(($([Convert]::ToUInt32($movesHex[0..7] -join "", 16)) % 65536))].Move
        "Move 2" = $moveArray[(($([Convert]::ToUInt32($movesHex[0..7] -join "", 16)) / 65536))].Move
        "Move 3" = $moveArray[(($([Convert]::ToUInt32($movesHex[8..15] -join "", 16)) % 65536))].Move
        "Move 4" = $moveArray[(($([Convert]::ToUInt32($movesHex[8..15] -join "", 16)) / 65536))].Move

    }
    return $moveIDs
}

function Get-PP ([string[]]$PPHex) {

    $PPamount = @{

        "Move 1" = [Convert]::ToUInt32($PPHex[6..7] -join "", 16)
        "Move 2" = [Convert]::ToUInt32($PPHex[4..5] -join "", 16)
        "Move 3" = [Convert]::ToUInt32($PPHex[2..3] -join "", 16)
        "Move 4" = [Convert]::ToUInt32($PPHex[0..1] -join "", 16)
        
    }
    return $PPamount
}

function Get-EffortValues ([string[]]$EVsHex) {

    $EffortValues = @{
        "Special Attack"  = [Convert]::ToUInt32($EVsHex[15..14] -join "", 16)
        "Special Defense" = [Convert]::ToUInt32($EVsHex[13..12] -join "", 16)
        "HP"              = [Convert]::ToUInt32($EVsHex[6..7] -join "", 16)
        "Attack"          = [Convert]::ToUInt32($EVsHex[4..5] -join "", 16)
        "Defense"         = [Convert]::ToUInt32($EVsHex[2..3] -join "", 16)
        "Speed"           = [Convert]::ToUInt32($EVsHex[0..1] -join "", 16)
        
    }
    return $EffortValues
}

function Get-Conditions ([string[]]$conditionsHex) {

    $conditionsInformation = @{
        "Cool"   = [Convert]::ToUInt32($conditionsHex[2..3] -join "", 16)
        "Beauty" = [Convert]::ToUInt32($conditionsHex[0..1] -join "", 16)
        "Cute"   = [Convert]::ToUInt32($conditionsHex[10..11] -join "", 16)
        "Smart"  = [Convert]::ToUInt32($conditionsHex[8..9] -join "", 16)
        "Tough"  = [Convert]::ToUInt32($conditionsHex[6..7] -join "", 16)
        "Luster" = [Convert]::ToUInt32($conditionsHex[4..5] -join "", 16)

    }
    return $conditionsInformation

}

function Get-PokerusStatus ([string[]]$pokerusHex) { return [Convert]::ToUInt32($pokerusHex -join "", 16) % 256 }

function Get-LocationCaught ([string[]]$locationCaughtHex) {

    $locationCaughtList = "$Mappings\locationCaught.csv"
    $locationCaughtArray = Import-CSV -Path $locationCaughtList
    $locationID = ([Convert]::ToUInt32($locationCaughtHex -join "", 16) / 256) % 256
    return $locationCaughtArray[$locationID].Location

}

function Get-LevelMet ([string[]]$levelMetHex) {
    return (([Convert]::ToUInt32($levelMetHex -join "", 16) / 65536) % 256 ) -band 127
}

function Get-GameCartridge ([string[]]$gameCartridgeHex) {
    $gameCartridgeList = "$Mappings\gameCartridge.csv"
    $gameCartridgeArray = Import-CSV -Path $gameCartridgeList
    $gameCartridgeID = [Math]::Floor(([Convert]::ToUInt32($gameCartridgeHex -join "", 16) / 8388608) % 16)
    return $gameCartridgeArray[$gameCartridgeID].Cartridge
}

function Get-BallCaught ([string[]]$ballCaughtHex) {
    $ballCaughtList = "$Mappings\ballCaught.csv"
    $ballCaughtArray = Import-CSV -Path $ballCaughtList
    $ballCaughtID = [Math]::Floor(([Convert]::ToUInt32($ballCaughtHex -join "", 16) / 134217728) % 16)
    return $ballCaughtArray[$ballCaughtID - 1].Ball
}

function Get-TrainerGender ([string[]]$trainerGenderHex) {
    $gender = [Math]::Floor([Convert]::ToUInt32($trainerGenderHex -join "", 16) / 2147483648) % 2
    if ($gender -eq 1) { return "Female" } else { return "Male" }
}

function Get-IndividualValues ([string[]]$IndividualValuesHex) {
    $IndividualValues = @{
        "Special Attack"  = [Math]::Floor(([Convert]::ToUInt32($IndividualValuesHex -join "", 16) / 1048576) % 32)
        "Special Defense" = [Math]::Floor(([Convert]::ToUInt32($IndividualValuesHex -join "", 16) / 33554432) % 32)
        "HP"              = [Math]::Floor([Convert]::ToUInt32($IndividualValuesHex -join "", 16) % 32)
        "Attack"          = [Math]::Floor(([Convert]::ToUInt32($IndividualValuesHex -join "", 16) / 32) % 32)
        "Defense"         = [Math]::Floor(([Convert]::ToUInt32($IndividualValuesHex -join "", 16) / 1024) % 32)
        "Speed"           = [Math]::Floor(([Convert]::ToUInt32($IndividualValuesHex -join "", 16) / 32768) % 32)
        
    }
    return $IndividualValues
}


function Get-EggFlag ([string[]]$eggFlagHex) { 
    $eggFlagNumber = [Math]::Floor(([Convert]::ToUInt32($eggFlagHex -join "", 16) / 1073741824 ) % 2)
    if ($eggFlagNumber -eq 0 ) { return $true } else { return $false } 
}

function Get-HiddenAbilityStatus ([string[]]$hiddenAbilityHex) {
    $hiddenAbilityNumber = [Math]::Floor(([Convert]::ToUInt32($hiddenAbilityHex -join "", 16) / 2147483648 ) % 2)
    if ($hiddenAbilityNumber -eq 1 ) { return $true } else { return $false } 
}

function Get-ContestInformation ([string[]]$contestInformationHex) {

    $contests = @{
        Cool           = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16)) % 8))"
        Beauty         = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 8 ) % 8))"
        Cute           = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 64 ) % 8))"
        Samrt          = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 512 ) % 8))"
        Tough          = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 4096 ) % 8))"
        Campion        = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 32768 ) % 2))"
        BattleLevel50  = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 65536 ) % 2))"
        BattleLevel100 = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 131072 ) % 2))"
        SketchRibbon   = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 262144 ) % 2))"
        HardWorker     = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 524288 ) % 2))"
        Special1       = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 1048576 ) % 2))"
        Special2       = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 2097152 ) % 2))"
        Special3       = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 4194304 ) % 2))"
        Special4       = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 8388608 ) % 2))"
        Special5       = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 16777216 ) % 2))"
        Special6       = "$(([Math]::Floor([Convert]::ToUInt32($contestInformationHex -join '', 16) / 67108864 ) % 2))"
    }
    return $contests
}

function Get-Obedience ([string[]]$ObedienceHex) {
    $obedienceNumber = [Math]::Floor($(([Convert]::ToUInt32($ObedienceHex -join "", 16)) / 2147483648 ) % 2)
    If ($obedienceNumber -eq 0) { return "Not Obedient" } else { return "Obedient" }
}

function Get-TrainerInformation {

    $trainerArray = @{
        'Name'   = Read-Host "Trainer's Name: "
        'Gender' = Read-Host "Trainer's Gender: "
        'Age'    = Read-Host "Trainer's Age: " 
    }

    return $trainerArray
}

function Get-PokemonHobby {
    $hobby = Read-Host "Pokemon Hobby: "

    return $hobby
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

    if ($flavorTextArray.Count -gt 4) {
        $flavorTextArray = $flavorTextArray | Select-Object -First 4
    }

    return $flavorTextArray

}

function Get-PokemonAge {

    $pokemonAge = Read-Host "Pokemon Age: "

    return $pokemonAge
}

$pk3Data = Get-PokemonBytes -Path $pokemonPath
$PokemonHex = ($pk3Data | ForEach-Object { $_.ToString("X2") }) -join ""
$reversePokemonID = $pk3Data[0..7] -join ""
$PokemonIDHex = ($pk3Data[3..0] | ForEach-Object { $_.ToString("X2") }) -join ""
$TrainerIDHex = ($pk3Data[7..4] | ForEach-Object { "{0:X2}" -f $_ }) -join ""
$TrainerID = Get-TrainerID $pk3Data[4..7]
$secretTrainerIDHex = ($pk3Data[7..6] | ForEach-Object { "{0:X2}" -f $_ }) -join ""
$secretTrainerID = Get-SecretTrainerID $pk3Data[4..7]
$hexOXR = [Convert]::ToString(([Convert]::ToUInt32($TrainerIDHex, 16) -bxor [Convert]::ToUInt32($PokemonIDHex, 16)), 16)
$nature = Get-Nature -PokemonID $PokemonIDHex
$gender = Get-Gender -PokemonID $PokemonIDHex -PokemonSpecies $localDexNumber
$ABCDOrder = Get-ABCDOrder -PokemonID $PokemonIDHex
$decryptionKey = Get-DecryptionKey -PokemonID $PokemonIDHex -TrainerID $TrainerIDHex
$isShiny = Get-ShinyStatus -decryptionKey $decryptionKey
$pokemonName = Get-Name -nameBytes $pk3Data[8..19]
$trainerName = Get-Name -nameBytes $pk3Data[20..26]
$markings = Get-Markings -markingByte $pk3Data[27]
$growth = $(Get-abcdDATA -ABCDOrder $ABCDOrder)."Growth"
$moves = $(Get-abcdDATA -ABCDOrder $ABCDOrder)."Moves"
$evs = $(Get-abcdDATA -ABCDOrder $ABCDOrder)."EVs"
$misc = $(Get-abcdDATA -ABCDOrder $ABCDOrder)."Misc"
$heldItem = Get-HeldItem -heldItem $growth[0..3]
$localDexNumber = Get-PokemonSpecies -localDexNumber $growth[4..7]
$exp = Get-Exp -expHex $growth[8..15]
$happiness = Get-Happiness -happinessHex $growth[16..24]
$moveNames = Get-Moves -movesHex $moves[0..15]
$PP = Get-PP -PPHex $moves[16..24]
$EffortValues = Get-EffortValues -EVsHex $evs[0..15]
$Conditions = Get-Conditions -ConditionsHex $evs[8..23]
$pokerus = Get-PokerusStatus -pokerusHEX $misc[0..7]
$locationCaught = Get-LocationCaught -locationCaughtHex $misc[0..7]
$levelMet = Get-LevelMet -levelMetHex $misc[0..7]
$gameCartridge = Get-GameCartridge -gameCartridgeHex $misc[0..7]
$ballCaught = Get-BallCaught -ballCaughtHex $misc[0..7]
$trainerGender = Get-TrainerGender -trainerGenderHex $misc[0..7]
$IndividualValues = Get-IndividualValues -IndividualValuesHex $misc[8..15]
$isEgg = Get-EggFlag -eggFlagHex $misc[8..15]
$hasHiddenAbility = Get-HiddenAbilityStatus -hiddenAbilityHex $misc[8..15]
$contests = Get-ContestInformation -contestInformationHex $misc[16..23]
$isObedient = Get-Obedience -ObedienceHex $misc[16..23]
$pokemonSpecies = $(Get-PokemonSpeciesName -PokemonSpecies $localDexNumber).Species
$nationalDexNumber = $(Get-PokemonSpeciesName -PokemonSpecies $localDexNumber).number
$trainerInformation = Get-TrainerInformation
$hobby = Get-PokemonHobby
$pokedexEntries = Get-PokeDexEntries -id $nationalDexNumber
$pokemonAge = Get-PokemonAge

Write-Host ""
Write-Host "PokemonHEX: $pokemonHEX"
Write-Host "PokemonID - [R]: $reversePokemonID"
Write-Host "PokemonID - [H]: $PokemonIDHex"
Write-Host "Nature: $nature"
Write-Host "Gender: $gender" # this will get enabled via the species number
Write-Host "Species: $pokemonSpecies"
Write-Host "National Dex Number: $nationalDexNumber"
Write-Host "ABCD Order: $ABCDOrder"
Write-Host "TrainerID - [H]: $TrainerIDHex" 
Write-Host "TrainerID - [N]: $TrainerID"
Write-Host "Secret TrainerID - [H]: $secretTrainerIDHex"
Write-Host "Secret TrainerID - [N]: $secretTrainerID"
Write-Host "DecrptionKey: $decryptionKey"
Write-Host "Shiny Status: $isShiny"
Write-Host "Pokemon Name: $pokemonName"
Write-Host "Trainer Name: $trainerName"
Write-Host "Markings: $markings"
Write-Host "Growth [H]: $growth"
Write-Host "Moves [H]: $moves"
Write-Host "EVs [H]: $evs"
Write-Host "Misc [H]: $misc"
Write-Host "Held Item: $heldItem"
Write-Host "Local Dex Number: $localDexNumber"
Write-Host "Exp: $exp"
Write-Host "Happiness: $happiness"
Write-Host "Move Names: $($moveNames.'Move 1'),$($moveNames.'Move 2'),$($moveNames.'Move 3'),$($moveNames.'Move 4')" 
Write-Host "PP: $($PP.'Move 1'),$($PP.'Move 2'),$($PP.'Move 3'),$($PP.'Move 4')"
Write-Host "EVs: $($EffortValues.'HP'),$($EffortValues.'Attack'),$($EffortValues.'Defense'),$($EffortValues.'Speed'),$($EffortValues.'Special Attack'),$($EffortValues.'Special Defense')"
Write-Host "Conditions: $($Conditions.'Cool'),$($Conditions.'Beauty'),$($Conditions.'Cute'),$($Conditions.'Smart'),$($Conditions.'Tough'),$($Conditions.'Luster')"
Write-Host "Pokerus: $pokerus"
Write-Host "Location Caught: $locationCaught"
Write-Host "Level Met: $levelMet"
Write-Host "Game Cartridge: $gameCartridge"
Write-Host "Ball Caught: $ballCaught"
Write-Host "Trainer Gender: $trainerGender"
Write-Host "Individual Values: $($IndividualValues.'HP'),$($IndividualValues.'Attack'),$($IndividualValues.'Defense'),$($IndividualValues.'Speed'),$($IndividualValues.'Special Attack'),$($IndividualValues.'Special Defense')"
Write-Host "Egg Status: $isEgg"
Write-Host "Hidden Ability Status: $hasHiddenAbility"
Write-Host "Contest Information: $($contests.Cool),$($contests.Beauty),$($contests.Cute),$($contests.Smart),$($contests.Tough),$($contests.Campion),$($contests.BattleLevel50),$($contests.BattleLevel100),$($contests.SketchRibbon),$($contests.SketchRibbon),$($contests.Special1),$($contests.Special2),$($contests.Special3),$($contests.Special4),$($contests.Special5),$($contests.Special6)"
Write-Host "Obediant Status: $isObedient"
Write-Host "TrainerName: $($trainerInformation.Name)"
Write-Host "TrainerGender: $($trainerInformation.Gender)"
Write-Host "TrainerAge: $($trainerInformation.Age)"
Write-Host "Pokemon's Hobby: $hobby"
Write-Host "Pokedex Entries: $($pokedexEntries[0])"
Write-Host "Pokemon Age: $pokemonAge"

function Update-JSON {
    param (
        [string]$TrainerName,
        [string]$TrainerGender,
        [string]$TrainerAge,
        [string]$PokemonName,
        [string]$PokemonSpecies,
        [string]$PokemonGender,
        [string]$nature,
        [string]$PokemonAge,
        [string]$PokemonHobby,
        [array]$PokemonEntries,
        [int]$NationalPokedexNumber,
        [string]$SystemResponse,
        [string]$SystemMemory,
        [string]$SystemTopicsToExplore,
        [string]$SystemPreviousConversationPoints,
        [string]$SystemCurrentTopic,
        [string]$SystemDreams,
        [string]$SystemInnerDialogue,
        [string]$SystemPrivateThoughts,
        [array]$SystemRules
    )

    $jsonObject = @{
        trainer = @{
            name   = $TrainerName
            gender = $TrainerGender
            age    = $TrainerAge
        }
        pokemon = @{
            name                  = $PokemonName
            nature                = $nature
            species               = $PokemonSpecies
            gender                = $PokemonGender
            age                   = $PokemonAge
            hobby                 = $PokemonHobby
            entries               = $PokemonEntries
            nationalPokedexNumber = $NationalPokedexNumber
        }
        system  = @{
            response                     = $SystemResponse
            memory                       = $SystemMemory
            topics_to_explore            = $SystemTopicsToExplore
            previous_conversation_points = $SystemPreviousConversationPoints
            current_topic                = $SystemCurrentTopic
            dreams                       = $SystemDreams
            inner_dialogue               = $SystemInnerDialogue
            private_thoughts             = $SystemPrivateThoughts
            rules                        = $SystemRules
        }
    }

    $json = $jsonObject | ConvertTo-Json -Depth 5
    return $json
}

$json = Update-JSON `
    -TrainerName $($trainerInformation.Name) `
    -TrainerGender $($trainerInformation.Gender) `
    -TrainerAge $($trainerInformation.Age) `
    -PokemonName $pokemonName `
    -PokemonSpecies $PokemonSpecies `
    -PokemonGender $gender `
    -nature $nature `
    -PokemonAge $pokemonAge `
    -PokemonHobby $hobby `
    -PokemonEntries $pokedexEntries `
    -NationalPokedexNumber $nationalDexNumber `
    -SystemResponse 'Response text based on the user input' `
    -SystemMemory 'key-value store of things I should remember about myself and the user' `
    -SystemTopicsToExplore 'detailed description of interesting topics to explore further' `
    -SystemPreviousConversationPoints 'list of previous conversation points' `
    -SystemCurrentTopic 'detailed description of the current topic' `
    -SystemDreams 'Create simulated detailed description of the system dreams based on previous conversations' `
    -SystemInnerDialogue 'Create simulated inner_dialogue based on the conversation' `
    -SystemPrivateThoughts 'Create simulated private thoughts based on the conversation' `
    -SystemRules @('You can use Pokemon sounds at the end or beginning of your responses', 'Response more like a Pokemon that can talk and less like an AI', 'If you are unable to provide a reply, you can fake a pokemon noise or confusion')

$jsonFilePath = Join-Path -Path $downloadsFolderPath -ChildPath "output.json"
Set-Content -Path $jsonFilePath -Value $json