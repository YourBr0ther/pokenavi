    
$moves = [ordered]@{

"Move 1" = "$($encryptedData[$aOffset+0])"
"Move 2" = "$($encryptedData[$aOffset+2])"
"Move 3" = "$($encryptedData[$aOffset+4])"
"Move 4" = "$($encryptedData[$aOffset+6])"
"Move 1 PP" = "$($encryptedData[$aOffset+8])"
"Move 2 PP" = "$($encryptedData[$aOffset+9])"
"Move 3 PP" = "$($encryptedData[$aOffset+10])"
"Move 4 PP" = "$($encryptedData[$aOffset+11])"

}
            
$growth = [ordered]@{

"Species" = "$($encryptedData[$gOffset+0..$gOffset+1])"
"Item Held" = "$($encryptedData[$gOffset+2..$gOffset+3])"
"Experience" = "$([BitConverter]::ToUInt32($($encryptedData[$gOffset+4..$gOffset+7]), 0))"
"PP Bonus" = "$($encryptedData[$gOffset+8..$gOffset+9])"
"Friendship" = "$($encryptedData[$gOffset+10])"
"Unknown" = "$($encryptedData[$gOffset+11..$gOffset+12])"

}
    
$EVs = [ordered]@{

"HP EV" = "$($encryptedData[$eOffset+0])"
"Attack EV" = "$($encryptedData[$eOffset+1])"
"Defense EV" = "$($encryptedData[$eOffset+2])"
"Speed EV" = "$($encryptedData[$eOffset+3])"
"Special Attack EV" = "$($encryptedData[$eOffset+4])"
"Special Defense EV" = "$($encryptedData[$eOffset+5])"

}
    
$ivBytes = $encryptedData[$mOffset+4..$mOffset+7]
$ivValue = [BitConverter]::ToUInt32($ivBytes, 0)
$miscellanoeous = [ordered]@{
        
    "Pokerus Status" = "$($encryptedData[$mOffset+0])"
    "Met Location" = "$($encryptedData[$mOffset+1])"
    "Origins Info" = "$($encryptedData[$mOffset+2..$mOffset+3])"
    "HP IV" = "$($ivValue -band 0x1F)"
    "Attack IV" = "$(($ivValue -shr 5) -band 0x1F)"
    "Defense IV" = "$(($ivValue -shr 10) -band 0x1F)"
    "Speed IV" = "$(($ivValue -shr 15) -band 0x1F)"
    "Special Attack IV" = "$(($ivValue -shr 20) -band 0x1F)"
    "Special Defense IV" = "$(($ivValue -shr 25) -band 0x1F)"

}