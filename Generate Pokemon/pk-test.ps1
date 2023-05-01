Clear-Host

function Floor([double]$number) {
    [Math]::Floor($number)
}

#$pokemonExport = ".\Generate Pokemon\Sample PK3\CHARMELEON.pk3" 
#$pk3Data = [System.IO.File]::ReadAllBytes($pokemonExport)

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

$b1 = ($pk3Data[31..34] | ForEach-Object { $_.ToString("X2") }) -join ""
$b2 = ($pk3Data[35..38] | ForEach-Object { $_.ToString("X2") }) -join ""
$b3 = ($pk3Data[39..42] | ForEach-Object { $_.ToString("X2") }) -join ""
$b4 = ($pk3Data[43..46] | ForEach-Object { $_.ToString("X2") }) -join ""

Write-Host "HEX RAW Block [35..32]: $b1"
Write-Host "HEX Raw Block [39..36]: $b2"
Write-Host "HEX Raw Block [43..40]: $b3"
Write-Host "HEX Raw Block [44..47]: $b4"

$fb1 = ($pk3Data[34..31] | ForEach-Object { $_.ToString("X2") }) -join ""
$fb2 = ($pk3Data[38..35] | ForEach-Object { $_.ToString("X2") }) -join ""
$fb3 = ($pk3Data[42..39] | ForEach-Object { $_.ToString("X2") }) -join ""
$fb4 = ($pk3Data[46..43] | ForEach-Object { $_.ToString("X2") }) -join ""

Write-Host "REV HEX RAW Block [35..32]: $fb1"
Write-Host "REV HEX Raw Block [39..36]: $fb2"
Write-Host "REV HEX Raw Block [43..40]: $fb3"
Write-Host "REV HEX Raw Block [44..47]: $fb4"

$db1 = [Convert]::ToString(([Convert]::ToInt32($fb1, 16) -bxor [Convert]::ToInt32($hexOXR, 16)), 16)
$db2 = [Convert]::ToString(([Convert]::ToInt32($fb2, 16) -bxor [Convert]::ToInt32($hexOXR, 16)), 16)
$db3 = [Convert]::ToString(([Convert]::ToInt32($fb3, 16) -bxor [Convert]::ToInt32($hexOXR, 16)), 16)
$db4 = [Convert]::ToString(([Convert]::ToInt32($fb4, 16) -bxor [Convert]::ToInt32($hexOXR, 16)), 16)

Write-Host "HEX Decrypted Block: $db1"
Write-Host "HEX Decrypted Block: $db2"
Write-Host "HEX Decrypted Block: $db3"
Write-Host "HEX Decrypted Block: $db4"

$combined = $db1 + $db2 + $db3 + $db4

Write-Host "HEX Block: $combined"

$byteArray = [System.Linq.Enumerable]::Range(0, $combined.Length - 1) `
| Where-Object { $_ % 2 -eq 0 } `
| ForEach-Object { [Convert]::ToByte($combined.Substring($_, 2), 16) }

# Output the byte array
Write-Host $byteArray

$byteArray[0]