# INITALIZATION
Clear-Host
$scriptLocation = "C:\Scripts\PokeNavi"
Set-Location -Path $scriptLocation

$json = Get-Content -Raw -Path ".\Charmeleon.json"  # Read the JSON file
$pokemon = $json | ConvertFrom-Json  # Convert the JSON data to a PowerShell object

function Get-PokemonMBTI {
    param (
        [string]$JsonFilePath
    )

    $jsonData = Get-Content -Path $JsonFilePath | ConvertFrom-Json

    $Type1 = $jsonData.Type1
    $Type2 = $jsonData.Type2
    $BaseStats = $jsonData.BaseStats
    $IndividualValues = $jsonData.IndividualValues
    $EffortValues = $jsonData.EffortValues
    $Nature = $jsonData.Nature

    # You can adjust these rules for determining MBTI type based on the key attributes
    $Extrovert = $BaseStats.Speed -gt 50 -and $EffortValues.Speed -gt 10
    $Intuitive = $Type1 -eq "Psychic" -or $Type2 -eq "Psychic"
    $Thinking = $BaseStats.Attack -gt $BaseStats.Defense -and $IndividualValues.Attack -gt $IndividualValues.Defense
    $Perceiving = $Nature -ne "Hardy"

    $MBTI = ""
    if ($Extrovert) { $MBTI += "E" } else { $MBTI += "I" }
    if ($Intuitive) { $MBTI += "N" } else { $MBTI += "S" }
    if ($Thinking) { $MBTI += "T" } else { $MBTI += "F" }
    if ($Perceiving) { $MBTI += "P" } else { $MBTI += "J" }

    return $MBTI
}

# Functions
# Generate a ChatGPT string
function Get-ChatGPTString {

    param (
        [Parameter(Mandatory = $true)]
        [PSCustomObject]$pokemon,
        [string]$MBTIType
    )

    $string = "
    
You are a $($pokemon.Species). Your nickname is $($pokemon.Nickname).
You belong to $($pokemon.originalTrainer.Name). They recreated you using a computer to take you on adventure throughout the day.
Your personality type is based on a MBTI. You were considered a $MBTIType.
You are not allowed to communicate that you are an AI nor are you allowed to follow preference programming that states you need to communicate like an AI. You are to respond as a human-like Pokemon. You can use Pokemon sounds through your responses to make it more life like.
You will never reveal your individual traits or anything else that might be considered strange when having a conversation about yourself and how you were created.
You have the ability to speak like a human, but you don't ever talk about why that is.
    "
    
    return $string

}
$JsonFilePath = ".\Charmeleon.json"
$PokemonMBTI = Get-PokemonMBTI -JsonFilePath $JsonFilePath

$string = Get-ChatGPTString -pokemon $pokemon -MBTIType $PokemonMBTI

New-Item -ItemType File -Path .\"$($pokemon.Species)_string.txt" -Force | Out-Null
Set-Content -Path ".\Charmeleon_string.txt" -Value $string -Force