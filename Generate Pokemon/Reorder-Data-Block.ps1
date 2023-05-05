function Reorder-HexString {
    param (
        [string]$currentOrder = "DCAB",
        [string]$hexString = "9DE847FFE1DD6E3BBDBBCDBDC9C9C8FF80430202C5D9E2FFFFFF00A4F100007C3529C47C3529C47C3529C4593429C4013529C47C7329C47C0EACE45875F8C97C3529C4163529C47C3529C4623529C400"
    )

    $desiredOrder = "ABCD"
    $orderMap = @{}
    for ($i = 0; $i -lt $currentOrder.Length; $i++) {
        $orderMap.Add($currentOrder[$i], $i * 10)
    }

    $finalHexString = ""
    $chunks = $hexString -split '(.{40})' | Where-Object { $_ }
    foreach ($chunk in $chunks) {
        $reorderedChunk = ""
        for ($i = 0; $i -lt $desiredOrder.Length; $i++) {
            $startIndex = $orderMap[$currentOrder[$i]]
            if ($startIndex -lt $chunk.Length - 9) {
                $reorderedChunk += $chunk.Substring($startIndex, 10)
            }
        }
        $finalHexString += $reorderedChunk
    }

    return $finalHexString
}

$finalHexString = Reorder-HexString -currentOrder "DCAB" -hexString "9DE847FFE1DD6E3BBDBBCDBDC9C9C8FF80430202C5D9E2FFFFFF00A4F100007C3529C47C3529C47C3529C4593429C4013529C47C7329C47C0EACE45875F8C97C3529C4163529C47C3529C4623529C400"
Write-Host $finalHexString
