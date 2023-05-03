Clear-Host

# Variables
$pokemonPath = ".\Generate Pokemon\Sample PK3\CHARMELEON.pk3"
$Mappings = ".\Generate Pokemon\Mappings"

function Get-PokemonBytes {
    param (
        [Parameter(Mandatory = $true)]
        [String]
        $Path
    )
    $pk3Data = $([System.IO.File]::ReadAllBytes($Path))[0..78]
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

function Get-DecryptionKey {
    param (
        [Parameter(Mandatory = $true)]
        [String]$TrainerIDHex,
        [String]$PokemonIDHex
    )

    $trainerIDInt = [Convert]::ToInt32($TrainerIDHex, 16)
    $pokemonIDInt = [Convert]::ToInt32($PokemonIDHex, 16)

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

    $characterList = "$Mappings\charMap.csv" # Replace this with the correct file path
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
        "Circle"   = [Convert]::ToInt32("0001", 2)
        "Square"   = [Convert]::ToInt32("0010", 2)
        "Triangle" = [Convert]::ToInt32("0100", 2)
        "Heart"    = [Convert]::ToInt32("1000", 2)
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

        for ($i = 31; $i -le 78; $i += 12) {
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
                $decryptedBlock = [Convert]::ToString(([Convert]::ToInt32($reversedBlock, 16) -bxor [Convert]::ToInt32($hexOXR, 16)), 16)
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
            "A" { $tempGrowth = $tempDataArray."$letter" }
            "B" { $tempMoves = $tempDataArray."$letter" }
            "C" { $tempEVs = $tempDataArray."$letter" }
            "D" { $tempMisc = $tempDataArray."$letter" }
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

function Get-Exp ([string[]]$expHex) { return [Convert]::ToInt32($expHex -join "", 16) }

function Get-Happiness ([string[]]$happinessHex) { return $(([Convert]::ToInt32($happinessHex -join "", 16) / 256) % 256 ) }



# Test
$pokemonHEX = "9DE847FFE1DD6E3BBDBBCDBDC9C9C8FF80430202C5D9E2FFFFFF00A4F100007C3529C47C3529C47C3529C4593429C4013529C47C7329C47C0EACE45875F8C97C3529C4163529C47C3529C4623529C4"
# Mankey
#$pokemonHEX = "8F11F92D198BF0A6CAE9E2D7DCEDFF0807000202BDC2CCC3CDFFFF00370700003800000084010000006500000A002B0043000000231E1400000001000000000000000000007A042247A8803D000000"
$pk3Data = [byte[]]::new($pokemonHEX.Length / 2)
for ($i = 0; $i -lt $pokemonHEX.Length; $i += 2) {
    $pk3Data[$i / 2] = [convert]::ToByte($pokemonHEX.Substring($i, 2), 16)
}

#$pk3Data = Get-PokemonBytes -Path $pokemonPath
$reversePokemonID = $pokemonHEX[0..7] -join ""
$pokemonIDBytes = $pk3Data[3..0]
$PokemonIDHex = ($pk3Data[3..0] | ForEach-Object { $_.ToString("X2") }) -join ""
$normalPokemonID = ($pokemonIDBytes | ForEach-Object { $_.ToString("X2") }) -join ""
$TrainerIDHex = ($pk3Data[7..4] | ForEach-Object { "{0:X2}" -f $_ }) -join ""
$TrainerID = Get-TrainerID $pk3Data[4..7]
$secretTrainerIDHex = ($pk3Data[7..6] | ForEach-Object { "{0:X2}" -f $_ }) -join ""
$secretTrainerID = Get-SecretTrainerID $pk3Data[4..7]
$hexOXR = [Convert]::ToString(([Convert]::ToInt32($TrainerIDHex, 16) -bxor [Convert]::ToInt32($PokemonIDHex, 16)), 16)
$nature = Get-Nature -PokemonID $normalPokemonID
#$gender = Get-Gender -PokemonID $normalPokemonID
$ABCDOrder = Get-ABCDOrder -PokemonID $normalPokemonID
$decryptionKey = Get-DecryptionKey -PokemonID $normalPokemonID -TrainerID $TrainerIDHex
$isShiny = Get-ShinyStatus -decryptionKey $decryptionKey
$pokemonName = Get-Name -nameBytes $pk3Data[8..19]
$trainerName = Get-Name -nameBytes $pk3Data[20..26]
$markings = Get-Markings -markingByte $pk3Data[27]
$growth = $(Get-abcdDATA -ABCDOrder $ABCDOrder)."Growth"
$moves = $(Get-abcdDATA -ABCDOrder $ABCDOrder)."Moves"
$evs = $(Get-abcdDATA -ABCDOrder $ABCDOrder)."EVs"
$misc = $(Get-abcdDATA -ABCDOrder $ABCDOrder)."Misc"
$exp = Get-Exp -expHex $moves[8..15]
$happiness = Get-Happiness -happinessHex $moves[16..24]

Write-Host ""
Write-Host "PokemonHEX: $pokemonHEX"
Write-Host "PokemonID - [R]: $reversePokemonID"
Write-Host "PokemonID - [N]: $normalPokemonID"
Write-Host "PokemonID - [H]: $PokemonIDHex"
Write-Host "Nature: $nature"
#Write-Host "Gender: $gender" # this will get enabled via the species number
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
Write-Host "Exp: $exp"
Write-Host "Happiness: $happiness"