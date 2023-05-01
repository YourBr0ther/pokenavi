Clear-Host

# Proper way to convert from HEX to DEC for Pokemon
# $decPokemonID = [System.Convert]::ToInt64($hexPokemonID, 16)
# Write-Host "Decimal Pokemon ID: $decPokemonID"

function Floor([double]$number) {
    [Math]::Floor($number)
}

#$hexString = "9de847ffe1dd6e3bbdbbcdbdc9c9c8ff80430202c5d9e2ffffff00a4f100007c3529c47c3529c47c3529c4593429c4013529c47c7329c47c0eace45875f8c97c3529c4163529c47c3529c4623529c4"
$hexString = "8F11F92D198BF0A6CAE9E2D7DCEDFF0807000202BDC2CCC3CDFFFF00370700003800000084010000006500000A002B0043000000231E1400000001000000000000000000007A042247A8803D000000"
$pk3Data = [System.Byte[]]::new($hexString.Length / 2)
for ($i = 0; $i -lt $hexString.Length; $i += 2) {
    $pk3Data[$i / 2] = [System.Byte]::Parse($hexString.Substring($i, 2), [System.Globalization.NumberStyles]::HexNumber)
}

$pokemonID = $pk3Data[3..0]
$reversePokemonID = $pk3Data[0..3]
$hexPokemonID = ($pokemonID | ForEach-Object { $_.ToString("X2") }) -join ""
$reversehexPokemonID = ($reversePokemonID | ForEach-Object { $_.ToString("X2") }) -join ""
$decimalValue = [System.Convert]::ToInt64($hexPokemonID, 16)

$ABCDOrder = Floor($decimalValue % 24)
$ABCDStructure = @("ABCD", "ABDC", "ACBD", "ACDB", "ADBC", "ADCB", "BACD", "BADC", "BCAD", "BCDA", "BDAC", "BDCA", "CADB", "CBAD", "CBDA", "CDAB", "CDBA", "DABC", "DACB", "DBAC", "DBCA", "DCAB", "DCBA")
$ABCDOrderValue = $ABCDStructure[$ABCDOrder - 1]

Write-Host "ABCDOrder: $ABCDOrderValue"
Write-Host ""
Write-Host "HEX Pokemon ID: $hexPokemonID"
Write-Host "HEX Reverse Pokemon ID: $reversehexPokemonID"
Write-Host "DEC Pokemon ID: $decimalValue"

$HexOTrainerID = ($pk3Data[7..4] | ForEach-Object { $_.ToString("X2") }) -join ""
Write-Host "HEX Original Trainer ID: $HexOTrainerID"
$hexOXR = [Convert]::ToString(([Convert]::ToInt32($HexOTrainerID, 16) -bxor [Convert]::ToInt32($hexPokemonID, 16)), 16)
Write-Host "HEX OXR Key: $hexOXR"
Write-Host ""

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
        $decryptedBlocks += $decryptedBlock
    }

    for ($j = 0; $j -lt 3; $j++) {
       # Write-Host "HEX RAW Block [$(($i + $j * 4 + 3)..($i + $j * 4))]: $($blocks[$j])"
       # Write-Host "REV HEX RAW Block [$(($i + $j * 4 + 3)..($i + $j * 4))]: $($reversedBlocks[$j])"
        Write-Host "HEX Decrypted Block: $($decryptedBlocks[$j])"
    }
    Write-Host ""
}

# Proper way to convert from HEX to DEC
$decPokemonID = [System.Convert]::ToInt64($hexPokemonID, 16)
$nature = $decPokemonID % 25

switch ($nature) {
    0 { $natureName = "Hardy" }
    1 { $natureName = "Lonely" }
    2 { $natureName = "Brave" }
    3 { $natureName = "Adamant" }
    4 { $natureName = "Naughty" }
    5 { $natureName = "Bold" }
    6 { $natureName = "Docile" }
    7 { $natureName = "Relaxed" }
    8 { $natureName = "Impish" }
    9 { $natureName = "Lax" }
    10 { $natureName = "Timid" }
    11 { $natureName = "Hasty" }
    12 { $natureName = "Serious" }
    13 { $natureName = "Jolly" }
    14 { $natureName = "Naive" }
    15 { $natureName = "Modest" }
    16 { $natureName = "Mild" }
    17 { $natureName = "Quiet" }
    18 { $natureName = "Bashful" }
    19 { $natureName = "Rash" }
    20 { $natureName = "Calm" }
    21 { $natureName = "Gentle" }
    22 { $natureName = "Sassy" }
    23 { $natureName = "Careful" }
    24 { $natureName = "Quirky" }
}

Write-Host "Nature ($nature): $natureName"


$byteValue = 0x164  # Example byte value
$binValue = ""
for ($i = 7; $i -ge 0; $i--) {
    $binValue += [Convert]::ToString(($byteValue -band [Math]::Pow(2, $i)) -shr $i, 2).PadLeft(1, "0")
}
$binValue = $binValue.Substring(4) + " " + $binValue.Substring(0, 4)
Write-Host "Binary value: $binValue"

