function Import-PK3 {
    param (
        [string]$FilePath
    )

    if (-not (Test-Path $FilePath)) {
        Write-Error "File not found: $FilePath"
        return
    }

    $pk3Data = [System.IO.File]::ReadAllBytes($FilePath)

    $blockOrderTable = @(
        (0,1,2,3), (0,1,3,2), (0,2,1,3), (0,3,1,2), (0,2,3,1), (0,3,2,1),
        (1,0,2,3), (1,0,3,2), (1,2,0,3), (1,3,0,2), (1,2,3,0), (1,3,2,0),
        (2,0,1,3), (2,0,3,1), (2,1,0,3), (2,3,0,1), (2,1,3,0), (2,3,1,0),
        (3,0,1,2), (3,0,2,1), (3,1,0,2), (3,2,0,1), (3,1,2,0), (3,2,1,0)
    )

    $personalityValue = [BitConverter]::ToUInt32($pk3Data, 0)
    $blockOrder = $blockOrderTable[$personalityValue % 24]

    $dataBlocks = @()
    for ($i = 0; $i -lt 4; $i++) {
        $offset = 0x24 + 0x10 * $blockOrder[$i]
        $dataBlocks += ,($pk3Data[$offset..($offset+11)])
    }

    $pk3Object = New-Object -TypeName psobject -Property @{
        PersonalityValue = $personalityValue
        TrainerID        = [BitConverter]::ToUInt32($pk3Data, 4)
        Nickname         = [System.Text.Encoding]::Unicode.GetString($pk3Data, 8, 10)
        Language         = [BitConverter]::ToUInt16($pk3Data, 20)
        TrainerName      = [System.Text.Encoding]::Unicode.GetString($pk3Data, 22, 14)
        Marking          = $pk3Data[36]
        Checksum         = $pk3Data[37]
        DataBlockA       = $dataBlocks[0]
        DataBlockB       = $dataBlocks[1]
        DataBlockC       = $dataBlocks[2]
        DataBlockD       = $dataBlocks[3]
        RawData          = $pk3Data
    }

    return $pk3Object
}
