function Get-abcdDATA () {
    param (
        [string]$existingOrder,
        [string]$defaultOrder = "ABCD"
    )

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
    Write-host $dataStructure
    $dataStructure = $dataStructure.Replace(" ", "")

    $part1 = $($dataStructure).Substring(0, 24)
    $part2 = $($dataStructure).Substring(24, 24)
    $part3 = $($dataStructure).Substring(48, 24)
    $part4 = $($dataStructure).Substring(72, 24)

    Write-Host $part1
    Write-Host $part2
    Write-Host $part3
    Write-Host $part4

    $arrayLabel = @("B", "A", "D", "C")
    
    $orderedArrayLabel = @()
    $existingOrder.ToCharArray() | ForEach-Object {
        $currentChar = $_
        $currentElement = $arrayLabel.Where({ $_ -eq $currentChar })[0]
        if ($currentElement) {
            $orderedArrayLabel += $currentElement
        }
    }
    
    $arrayLabel = $orderedArrayLabel

    $array = @($part1, $part2, $part3, $part4)
    Write-Host "Part 1 $($array.'Part1')"

    $finalArray = @()
    foreach ($letter in $defaultOrder.ToCharArray()) {
        $partIndex = [array]::IndexOf($arrayLabel, $letter.ToString())
        $part = $array[$partIndex]
        $finalArray += $part    }

    $DataArray = @{
        "Growth" = $finalArray[0]
        "Moves"  = $finalArray[1]
        "EVs"    = $finalArray[2]
        "Misc"   = $finalArray[3]
    }   

    return $DataArray
}