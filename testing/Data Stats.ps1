    
$moves = [ordered]@{

"Move 1" = "$($encryptedData[$a+0])"
"Move 2" = "$($encryptedData[$a+2])"
"Move 3" = "$($encryptedData[$a+4])"
"Move 4" = "$($encryptedData[$a+6])"
"Move 1 PP" = "$($encryptedData[$a+8])"
"Move 2 PP" = "$($encryptedData[$a+9])"
"Move 3 PP" = "$($encryptedData[$a+10])"
"Move 4 PP" = "$($encryptedData[$a+11])"

}
            
$growth = [ordered]@{

"Species" = "$($encryptedData[$b+0..$b+1])"
"Item Held" = "$($encryptedData[$b+2..$b+3])"
"Experience" = "$([BitConverter]::ToUInt32($($encryptedData[$b+4..$b+7]), 0))"
"PP Bonus" = "$($encryptedData[$b+8..$b+9])"
"Friendship" = "$($encryptedData[$b+10])"
"Unknown" = "$($encryptedData[$b+11..$b+12])"

}
    
$EVs = [ordered]@{

"HP EV" = "$($encryptedData[$b+0])"
"Attack EV" = "$($encryptedData[$b+1])"
"Defense EV" = "$($encryptedData[$b+2])"
"Speed EV" = "$($encryptedData[$b+3])"
"Special Attack EV" = "$($encryptedData[$b+4])"
"Special Defense EV" = "$($encryptedData[$b+5])"

}
    
$ivBytes = $encryptedData[$b+4..$b+7]
$ivValue = [BitConverter]::ToUInt32($ivBytes, 0)
$miscellanoeous = [ordered]@{
        
    "Pokerus Status" = "$($encryptedData[$b+0])"
    "Met Location" = "$($encryptedData[$b+1])"
    "Origins Info" = "$($encryptedData[$b+2..$b+3])"
    "HP IV" = "$($ivValue -band 0x1F)"
    "Attack IV" = "$(($ivValue -shr 5) -band 0x1F)"
    "Defense IV" = "$(($ivValue -shr 10) -band 0x1F)"
    "Speed IV" = "$(($ivValue -shr 15) -band 0x1F)"
    "Special Attack IV" = "$(($ivValue -shr 20) -band 0x1F)"
    "Special Defense IV" = "$(($ivValue -shr 25) -band 0x1F)"

}
