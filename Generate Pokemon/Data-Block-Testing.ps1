Clear-Host
#$pokemonPath = ".\Generate Pokemon\Sample PK3\005 - CHARMELEON - D97425D07CE5.ek3"
#$pokemonPath = ".\Generate Pokemon\Sample PK3\013 - WEEDLE - 92FA9F695FAD.ek3"
$pokemonPath = ".\Generate Pokemon\Sample PK3\056 - MANKEY - 07372DF9118F.ek3"


function Get-PokemonBytes {
    param (
        [Parameter(Mandatory = $true)]
        [String]
        $Path
    )
    $pk3Data = $([System.IO.File]::ReadAllBytes($Path))[0..79]
    return $pk3Data
}

function Get-ABCDOrder {
    param (
        [Parameter(Mandatory = $true)]
        [String]$PokemonID
    )
    $ABCDList = "$Mappings\ABCD-Structure.csv"
    $ABCDArray = Import-CSV -Path $ABCDList
    $PokemonIDDC = [System.Convert]::ToUInt32($PokemonID, 16) # Updated to use ToUInt32 method
    $order = [Math]::Floor($PokemonIDDC % 24)
    return $ABCDArray.Permutation[$order]
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
                $decryptedBlock = [Convert]::ToString(([Convert]::ToUInt32($reversedBlock, 16) -bxor [Convert]::ToUInt32($hexOXR, 16)), 16) # Updated to use ToUInt32 method
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
function Get-DecryptionKey {
    param (
        [Parameter(Mandatory = $true)]
        [String]$TrainerIDHex,
        [String]$PokemonIDHex
    )
    $trainerIDInt = [Convert]::ToUInt32($TrainerIDHex, 16) # Updated to use ToUInt32 method
    $pokemonIDInt = [Convert]::ToUInt32($PokemonIDHex, 16) # Updated to use ToUInt32 method
    $unsignedResult = $pokemonIDInt -bxor $trainerIDInt # Ensures the result is always an unsigned integer
    $bytes = [BitConverter]::GetBytes($unsignedResult)
    $result = [BitConverter]::ToUInt32($bytes, 0)
    return $result
}
        
$pk3Data = Get-PokemonBytes -Path $pokemonPath
$pokemonString = ($pk3Data | ForEach-Object { $_.ToString("X2") }) -join ""
        
$PokemonIDHex = ($pk3Data[3..0] | ForEach-Object { $_.ToString("X2") }) -join ""
$TrainerIDHex = ($pk3Data[7..4] | ForEach-Object { $_.ToString("X2") }) -join ""
        
$PokemonIDInt = [Convert]::ToUInt32($PokemonIDHex, 16) # Updated to use ToUInt32 method
$TrainerIDInt = [Convert]::ToUInt32($TrainerIDHex, 16) # Updated to use ToUInt32 method
$XORInt = $PokemonIDInt -bxor $TrainerIDInt
$XORHex = ($XORInt | ForEach-Object { $_.ToString("X2") }) -join ""
$decryptionKey = Get-DecryptionKey -PokemonID $PokemonIDHex -TrainerID $TrainerIDHex
$ABCDOrder = Get-ABCDOrder -PokemonID $PokemonIDHex
Write-Host $ABCDOrder
              
$b1 = ($pk3Data[32..35] | ForEach-Object { $_.ToString("X2") }) -join ""
$b2 = ($pk3Data[36..39] | ForEach-Object { $_.ToString("X2") }) -join ""
$b3 = ($pk3Data[40..43] | ForEach-Object { $_.ToString("X2") }) -join ""
$b4 = ($pk3Data[44..47] | ForEach-Object { $_.ToString("X2") }) -join ""
$b5 = ($pk3Data[48..51] | ForEach-Object { $_.ToString("X2") }) -join ""
$b6 = ($pk3Data[52..55] | ForEach-Object { $_.ToString("X2") }) -join ""
$b7 = ($pk3Data[56..59] | ForEach-Object { $_.ToString("X2") }) -join ""
$b8 = ($pk3Data[60..63] | ForEach-Object { $_.ToString("X2") }) -join ""
$b9 = ($pk3Data[64..67] | ForEach-Object { $_.ToString("X2") }) -join ""
$b10 = ($pk3Data[68..71] | ForEach-Object { $_.ToString("X2") }) -join ""
$b11 = ($pk3Data[72..75] | ForEach-Object { $_.ToString("X2") }) -join ""
$b12 = ($pk3Data[76..79] | ForEach-Object { $_.ToString("X2") }) -join ""
     
$rb1 = ($pk3Data[35..32] | ForEach-Object { $_.ToString("X2") }) -join ""
$rb2 = ($pk3Data[39..36] | ForEach-Object { $_.ToString("X2") }) -join ""
$rb3 = ($pk3Data[43..40] | ForEach-Object { $_.ToString("X2") }) -join ""
$rb4 = ($pk3Data[47..44] | ForEach-Object { $_.ToString("X2") }) -join ""
$rb5 = ($pk3Data[51..48] | ForEach-Object { $_.ToString("X2") }) -join ""
$rb6 = ($pk3Data[55..52] | ForEach-Object { $_.ToString("X2") }) -join ""
$rb7 = ($pk3Data[59..56] | ForEach-Object { $_.ToString("X2") }) -join ""
$rb8 = ($pk3Data[63..60] | ForEach-Object { $_.ToString("X2") }) -join ""
$rb9 = ($pk3Data[67..64] | ForEach-Object { $_.ToString("X2") }) -join ""
$rb10 = ($pk3Data[71..68] | ForEach-Object { $_.ToString("X2") }) -join ""
$rb11 = ($pk3Data[75..72] | ForEach-Object { $_.ToString("X2") }) -join ""
$rb12 = ($pk3Data[79..76] | ForEach-Object { $_.ToString("X2") }) -join ""

$db1Int = $([Convert]::ToUInt32($rb1, 16)) -bxor $XORInt
$db1Hex = $(($db1Int | ForEach-Object { $_.ToString("X2") }) -join "").PadLeft(8, '0')
$db2Int = $([Convert]::ToUInt32($rb2, 16)) -bxor $XORInt
$db2Hex = $(($db2Int | ForEach-Object { $_.ToString("X2") }) -join "").PadLeft(8, '0')
$db3Int = $([Convert]::ToUInt32($rb3, 16)) -bxor $XORInt
$db3Hex = $(($db3Int | ForEach-Object { $_.ToString("X2") }) -join "").PadLeft(8, '0')
$db4Int = $([Convert]::ToUInt32($rb4, 16)) -bxor $XORInt
$db4Hex = $(($db4Int | ForEach-Object { $_.ToString("X2") }) -join "").PadLeft(8, '0')
$db5Int = $([Convert]::ToUInt32($rb5, 16)) -bxor $XORInt
$db5Hex = $(($db5Int | ForEach-Object { $_.ToString("X2") }) -join "").PadLeft(8, '0')
$db6Int = $([Convert]::ToUInt32($rb6, 16)) -bxor $XORInt
$db6Hex = $(($db6Int | ForEach-Object { $_.ToString("X2") }) -join "").PadLeft(8, '0')
$db7Int = $([Convert]::ToUInt32($rb7, 16)) -bxor $XORInt
$db7Hex = $(($db7Int | ForEach-Object { $_.ToString("X2") }) -join "").PadLeft(8, '0')
$db8Int = $([Convert]::ToUInt32($rb8, 16)) -bxor $XORInt
$db8Hex = $(($db8Int | ForEach-Object { $_.ToString("X2") }) -join "").PadLeft(8, '0')
$db9Int = $([Convert]::ToUInt32($rb9, 16)) -bxor $XORInt
$db9Hex = $(($db9Int | ForEach-Object { $_.ToString("X2") }) -join "").PadLeft(8, '0')
$db10Int = $([Convert]::ToUInt32($rb10, 16)) -bxor $XORInt
$db10Hex = $(($db10Int | ForEach-Object { $_.ToString("X2") }) -join "").PadLeft(8, '0')
$db11Int = $([Convert]::ToUInt32($rb11, 16)) -bxor $XORInt
$db11Hex = $(($db11Int | ForEach-Object { $_.ToString("X2") }) -join "").PadLeft(8, '0')
$db12Int = $([Convert]::ToUInt32($rb12, 16)) -bxor $XORInt
$db12Hex = $(($db12Int | ForEach-Object { $_.ToString("X2") }) -join "").PadLeft(8, '0')

# Write-Host "Hex String: $pokemonString"
# Write-Host "PokemonID - [H]: $PokemonIDHex"
# Write-Host "TrainerID - [H]: $TrainerIDHex"
# Write-Host "PokemonID - [I]: $PokemonIDInt"
# Write-Host "TrainerID - [I]: $TrainerIDInt"
# Write-Host "DecryptionKey [H]: $XORHex"
# Write-Host "DecryptionKey [I]: $XORInt"
# Write-Host "   Normal Block 1 $b1" 
# Write-Host "   Normal Block 2 $b2"
# Write-Host "   Normal Block 3 $b3"
# Write-Host "   Normal Block 4 $b4"
# Write-Host "   Normal Block 5 $b5" 
# Write-Host "   Normal Block 6 $b6"
# Write-Host "   Normal Block 7 $b7"
# Write-Host "   Normal Block 8 $b8"
# Write-Host "   Normal Block 9 $b9" 
# Write-Host "   Normal Block 10 $b10"
# Write-Host "   Normal Block 11 $b11"
# Write-Host "   Normal Block 12 $b12"
# Write-Host " Reversed Block 1 $rb1" 
# Write-Host " Reversed Block 2 $rb2"
# Write-Host " Reversed Block 3 $rb3"
# Write-Host " Reversed Block 4 $rb4"
# Write-Host " Reversed Block 5 $rb5" 
# Write-Host " Reversed Block 6 $rb6"
# Write-Host " Reversed Block 7 $rb7"
# Write-Host " Reversed Block 8 $rb8"
# Write-Host " Reversed Block 9 $rb9" 
# Write-Host " Reversed Block 10 $rb10"
# Write-Host " Reversed Block 11 $rb11"
# Write-Host " Reversed Block 12 $rb12"
Write-Host "Decrypted Block 01 [H]: $db1Hex"
Write-Host "Decrypted Block 02 [H]: $db2Hex"
Write-Host "Decrypted Block 03 [H]: $db3Hex"
Write-Host "Decrypted Block 04 [H]: $db4Hex"
Write-Host "Decrypted Block 05 [H]: $db5Hex"
Write-Host "Decrypted Block 06 [H]: $db6Hex"
Write-Host "Decrypted Block 07 [H]: $db7Hex"
Write-Host "Decrypted Block 08 [H]: $db8Hex"
Write-Host "Decrypted Block 09 [H]: $db9Hex"
Write-Host "Decrypted Block 10 [H]: $db10Hex"
Write-Host "Decrypted Block 11 [H]: $db11Hex"
Write-Host "Decrypted Block 12 [H]: $db12Hex"