# INITALIZATION
Clear-Host
$scriptLocation = "C:\Scripts\PokeNavi"
Set-Location -Path $scriptLocation

$json = Get-Content -Raw -Path ".\Charmeleon.json"  # Read the JSON file
$pokemon = $json | ConvertFrom-Json  # Convert the JSON data to a PowerShell object
$pokemon.originalTrainer.Name = "Chris"
$pokemon.Nickname = "Maggie"

# Functions
# Generate a ChatGPT string
function Get-ChatGPTString {

    param (
        [Parameter(Mandatory = $true)]
        [PSCustomObject]$pokemon
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

function Get-MBTIPokemonType {
    param (
        [Parameter(Mandatory = $true)]
        [PSCustomObject]$pokemon
    )

    $MBTIMatrix = @{
        'ISTJ' = @{
            'Nature'  = 'Brave';
            'IVFocus' = 'HP', 'Attack';
            'EVFocus' = 'HP', 'Attack';
        };
        'ISFJ' = @{
            'Nature'  = 'Careful';
            'IVFocus' = 'HP', 'Defense';
            'EVFocus' = 'HP', 'Defense';
        };
        'INFJ' = @{
            'Nature'  = 'Calm';
            'IVFocus' = 'HP', 'Sp.Defense';
            'EVFocus' = 'HP', 'Sp.Defense';
        };
        'INTJ' = @{
            'Nature'  = 'Quiet';
            'IVFocus' = 'HP', 'Sp.Attack';
            'EVFocus' = 'HP', 'Sp.Attack';
        };
        'ISTP' = @{
            'Nature'  = 'Adamant';
            'IVFocus' = 'Attack', 'Speed';
            'EVFocus' = 'Attack', 'Speed';
        };
        'ISFP' = @{
            'Nature'  = 'Impish';
            'IVFocus' = 'Attack', 'Defense';
            'EVFocus' = 'Attack', 'Defense';
        };
        'INFP' = @{
            'Nature'  = 'Bold';
            'IVFocus' = 'Defense', 'Speed';
            'EVFocus' = 'Defense', 'Speed';
        };
        'INTP' = @{
            'Nature'  = 'Modest';
            'IVFocus' = 'Sp.Attack', 'Speed';
            'EVFocus' = 'Sp.Attack', 'Speed';
        };
        'ESTP' = @{
            'Nature'  = 'Jolly';
            'IVFocus' = 'Speed', 'Attack';
            'EVFocus' = 'Speed', 'Attack';
        };
        'ESFP' = @{
            'Nature'  = 'Naive';
            'IVFocus' = 'Speed', 'Sp.Attack';
            'EVFocus' = 'Speed', 'Sp.Attack';
        };
        'ENFP' = @{
            'Nature'  = 'Timid';
            'IVFocus' = 'Speed', 'Sp.Defense';
            'EVFocus' = 'Speed', 'Sp.Defense';
        };
        'ENTP' = @{
            'Nature'  = 'Hasty';
            'IVFocus' = 'Speed', 'Defense';
            'EVFocus' = 'Speed', 'Defense';
        };
        'ESTJ' = @{
            'Nature'  = 'Lonely';
            'IVFocus' = 'Attack', 'HP';
            'EVFocus' = 'Attack', 'HP';
        };
        'ESFJ' = @{
            'Nature'  = 'Lax';
            'IVFocus' = 'Defense', 'HP';
            'EVFocus' = 'Defense', 'HP';
        };
        'ENFJ' = @{
            'Nature'  = 'Gentle';
            'IVFocus' = 'Sp.Defense', 'HP';
            'EVFocus' = 'Sp.Defense', 'HP';
        };
        'ENTJ' = @{
            'Nature'  = 'Mild';
            'IVFocus' = 'Sp.Attack', 'HP';
            'EVFocus' = 'Sp.Attack', 'HP';
        };
    }

    function Test-IVFocus($IVs, $IVFocus) {
        $highestIVs = $IVs.GetEnumerator() | Sort-Object -Descending -Property Value | Select-Object -First 2 -ExpandProperty Name
        return (Compare-Object -ReferenceObject $highestIVs -DifferenceObject $IVFocus -IncludeEqual).Count -eq $IVFocus.Count
    }

    function Test-EVFocus($EVs, $EVFocus) {
        $highestEVs = $EVs.GetEnumerator() | Sort-Object -Descending -Property Value | Select-Object -First 2 -ExpandProperty Name
        return (Compare-Object -ReferenceObject $highestEVs -DifferenceObject $EVFocus -IncludeEqual).Count -eq $EVFocus.Count
    }

    $MBTIType = $null

    foreach ($type in $MBTIMatrix.Keys) {
        $MBTI = $MBTIMatrix[$type]
        if ($Pokemon.Nature -eq $MBTI.Nature -and (Test-IVFocus -IVs $Pokemon.IndividualValues -IVFocus $MBTI.IVFocus) -and (Test-EVFocus -EVs $Pokemon.EffortValues -EVFocus $MBTI.EVFocus)) {
            $MBTIType = $type
            break
        }
    }

    if ($null -eq $MBTIType) {
        Write-Error "No matching MBTI type found for the given Pokemon object."
        return
    }

    return $MBTIType
}

# Usage example with the previously created $pokemon object:
$MBTIType = Get-MBTIPokemonType -pokemon $pokemon

# Generate a ChatGPT string
$string = Get-ChatGPTString -pokemon $pokemon