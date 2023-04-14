$pokemon = [PSCustomObject]@{
    NationalPokedexNumber = 025
    Species = 'Pikachu'
    Type1 = 'Electric'
    Type2 = $null
    BaseStats = @{
        HP = 35
        Attack = 40
        Defense = 30
        SpecialAttack = 50
        SpecialDefense = 50
        Speed = 90
    }
    Abilities = @('Static', 'Lightning Rod')
    Moves = @('Thunderbolt', 'Quick Attack', 'Iron Tail', 'Thunder')
    Level = 50
    ExperiencePoints = 125000
    IndividualValues = @{
        HP = 31
        Attack = 28
        Defense = 20
        SpecialAttack = 31
        SpecialDefense = 25
        Speed = 29
    }
    EffortValues = @{
        HP = 0
        Attack = 0
        Defense = 0
        SpecialAttack = 252
        SpecialDefense = 0
        Speed = 252
    }
    Nature = 'Timid'
    HeldItem = 'Light Ball'
    Gender = 'Male'
    OriginalTrainer = @{
        Name = 'Ash'
        TrainerID = 12345
        SecretID = 54321
    }
    Friendship = 255
    Nickname = 'Sparky'
    ShinyStatus = $false
    BallCaught = 'Poke Ball'
    Ribbons = @('Effort Ribbon', 'Best Friends Ribbon')
    Markings = @('Circle', 'Triangle')
}

# Accessing a property from the object:
Write-Host $pokemon.Species

function Get-MBTIPokemonType {
    param (
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Pokemon
    )

    $MBTIMatrix = @{
    'ISTJ' = @{
        'Nature' = 'Brave';
        'IVFocus' = 'HP', 'Attack';
        'EVFocus' = 'HP', 'Attack';
    };
    'ISFJ' = @{
        'Nature' = 'Careful';
        'IVFocus' = 'HP', 'Defense';
        'EVFocus' = 'HP', 'Defense';
    };
    'INFJ' = @{
        'Nature' = 'Calm';
        'IVFocus' = 'HP', 'Sp.Defense';
        'EVFocus' = 'HP', 'Sp.Defense';
    };
    'INTJ' = @{
        'Nature' = 'Quiet';
        'IVFocus' = 'HP', 'Sp.Attack';
        'EVFocus' = 'HP', 'Sp.Attack';
    };
    'ISTP' = @{
        'Nature' = 'Adamant';
        'IVFocus' = 'Attack', 'Speed';
        'EVFocus' = 'Attack', 'Speed';
    };
    'ISFP' = @{
        'Nature' = 'Impish';
        'IVFocus' = 'Attack', 'Defense';
        'EVFocus' = 'Attack', 'Defense';
    };
    'INFP' = @{
        'Nature' = 'Bold';
        'IVFocus' = 'Defense', 'Speed';
        'EVFocus' = 'Defense', 'Speed';
    };
    'INTP' = @{
        'Nature' = 'Modest';
        'IVFocus' = 'Sp.Attack', 'Speed';
        'EVFocus' = 'Sp.Attack', 'Speed';
    };
    'ESTP' = @{
        'Nature' = 'Jolly';
        'IVFocus' = 'Speed', 'Attack';
        'EVFocus' = 'Speed', 'Attack';
    };
    'ESFP' = @{
        'Nature' = 'Naive';
        'IVFocus' = 'Speed', 'Sp.Attack';
        'EVFocus' = 'Speed', 'Sp.Attack';
    };
    'ENFP' = @{
        'Nature' = 'Timid';
        'IVFocus' = 'Speed', 'Sp.Defense';
        'EVFocus' = 'Speed', 'Sp.Defense';
    };
    'ENTP' = @{
        'Nature' = 'Hasty';
        'IVFocus' = 'Speed', 'Defense';
        'EVFocus' = 'Speed', 'Defense';
    };
    'ESTJ' = @{
        'Nature' = 'Lonely';
        'IVFocus' = 'Attack', 'HP';
        'EVFocus' = 'Attack', 'HP';
    };
    'ESFJ' = @{
        'Nature' = 'Lax';
        'IVFocus' = 'Defense', 'HP';
        'EVFocus' = 'Defense', 'HP';
    };
    'ENFJ' = @{
        'Nature' = 'Gentle';
        'IVFocus' = 'Sp.Defense', 'HP';
        'EVFocus' = 'Sp.Defense', 'HP';
    };
    'ENTJ' = @{
        'Nature' = 'Mild';
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
        Write-Error "No matching MBTI type found for the given Pokémon object."
        return
    }

    return $MBTIType
}

# Usage example with the previously created $pokemon object:
$MBTIType = Get-MBTIPokemonType -Pokemon $pokemon
Write-Host "The MBTI type for $($pokemon.Nickname) is $MBTIType."

