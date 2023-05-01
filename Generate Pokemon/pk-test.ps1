Clear-Host

function Floor([double]$number) {
    [Math]::Floor($number)
}

# $pokemonExport = ".\Generate Pokemon\Sample PK3\CHARMELEON.pk3" 
# $pk3Data = [System.IO.File]::ReadAllBytes($pokemonExport)

$hexString = "9de847ffe1dd6e3bbdbbcdbdc9c9c8ff80430202c5d9e2ffffff00a4f100007c3529c47c3529c47c3529c4593429c4013529c47c7329c47c0eace45875f8c97c3529c4163529c47c3529c4623529c4"
$pk3Data = [System.Byte[]]::new($hexString.Length / 2)
 for ($i = 0; $i -lt $hexString.Length; $i += 2) {
     $pk3Data[$i / 2] = [System.Byte]::Parse($hexString.Substring($i, 2), [System.Globalization.NumberStyles]::HexNumber)
 }

$pokemonID = $pk3Data[3..0]
$reversePokemonID = $pk3Data[0..3]
$hexPokemonID = ($pokemonID | ForEach-Object { $_.ToString("X2") }) -join ""
$reversehexPokemonID = ($reversePokemonID | ForEach-Object { $_.ToString("X2") }) -join ""

Write-Host "HEX Pokemon ID: $hexPokemonID"
Write-Host "HEX Reverse Pokemon ID: $reversehexPokemonID"
Write-Host ""

$decimalValue = [System.UInt32]::Parse($hexPokemonID, [System.Globalization.NumberStyles]::HexNumber)
Write-Host "The decimal value of $hexPokemonID is $decimalValue"

# Calculate ABCDOrder
$ABCDOrder = Floor($decimalValue % 24)
$ABCDStructure = @("ABCD", "ABDC", "ACBD", "ACDB", "ADBC", "ADCB", "BACD", "BADC", "BCAD", "BCDA", "BDAC", "BDCA", "CADB", "CBAD", "CBDA", "CDAB", "CDBA", "DABC", "DACB", "DBAC", "DBCA", "DCAB", "DCBA")
$ABCDOrderValue = $ABCDStructure[$ABCDOrder - 1]  # Get the ABCD order value from the ABCDStructure array

Write-Host ""
Write-Host "ABCDOrder: $ABCDOrderValue"

$HexOTrainerID = ($pk3Data[7..4] | ForEach-Object { $_.ToString("X2") }) -join ""
Write-Host "HEX Pokemon ID: $hexPokemonID"
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
        Write-Host "HEX RAW Block [$(($i + $j * 4 + 3)..($i + $j * 4))]: $($blocks[$j])"
        Write-Host "REV HEX RAW Block [$(($i + $j * 4 + 3)..($i + $j * 4))]: $($reversedBlocks[$j])"
        Write-Host "HEX Decrypted Block: $($decryptedBlocks[$j])"
    }

    $combined = $decryptedBlocks -join ""
    Write-Host "HEX Block: $combined"
    Write-Host ""
}
