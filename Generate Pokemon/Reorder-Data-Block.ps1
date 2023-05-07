Clear-Host
function Get-OrganizedString {
    param (
        [string]$existingOrder,
        [string]$ABCDOrder,
        [string]$hexString
    )

    # Split the string into four variables of 40 characters each
    $part1 = $hexString.Substring(0, 40)
    $part2 = $hexString.Substring(40, 40)
    $part3 = $hexString.Substring(80, 40)
    $part4 = $hexString.Substring(120, 40)

    # Define the label order for the parts
    
    $arrayLabel = @("B","A","D","C")
    
    $orderedArrayLabel = @()
    $existingOrder.ToCharArray() | ForEach-Object {
        $currentChar = $_
        $currentElement = $arrayLabel.Where({ $_ -eq $currentChar })[0]
        if ($currentElement) {
            $orderedArrayLabel += $currentElement
        }
    }
    
    $arrayLabel = $orderedArrayLabel
    
    # Put the variables into an ordered array
    $array = @($part1, $part2, $part3, $part4)

    # Reorder the array based on the current order
    $finalArray = @()
    foreach ($letter in $ABCDOrder.ToCharArray()) {
        $partIndex = [array]::IndexOf($arrayLabel, $letter.ToString())
        $part = $array[$partIndex]
        $finalArray += $part
        Write-Host "Part $letter at index $partIndex added to final array"
    }



    return $finalArray
}

$ABCDOrder = "DACB"
$finalHexString = Get-OrganizedString -existingOrder $ABCDOrder -newOrder "ABCD" -hexString "9DE847FFE1DD6E3BBDBBCDBDC9C9C8FF80430202C5D9E2FFFFFF00A4F100007C3529C47C3529C47C3529C4593429C4013529C47C7329C47C0EACE45875F8C97C3529C4163529C47C3529C4623529C400"
Write-Host $finalHexString
