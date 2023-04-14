$pokemon = [PSCustomObject]@{
    NationalPokedexNumber = 
    Species = ''
    Type1 = ''
    Type2 = $null
    BaseStats = @{
        HP = 0
        Attack = 0
        Defense = 0
        SpecialAttack = 0
        SpecialDefense = 0
        Speed = 0
    }
    Abilities = @('', '')
    Moves = @('', '', '', '')
    Level = 0
    ExperiencePoints = 0
    IndividualValues = @{
        HP = 0
        Attack = 0
        Defense = 0
        SpecialAttack = 0
        SpecialDefense = 0
        Speed = 0
    }
    EffortValues = @{
        HP = 0
        Attack = 0
        Defense = 0
        SpecialAttack = 0
        SpecialDefense = 0
        Speed = 0
    }
    Nature = ''
    HeldItem = ''
    Gender = ''
    OriginalTrainer = @{
        Name = ''
        TrainerID = 0
        SecretID = 0
    }
    Friendship = 0
    Nickname = ''
    ShinyStatus = $false
    BallCaught = ''
    Ribbons = @('', '')
    Markings = @('', '')
}

# Accessing a property from the object:
Write-Host $pokemon.Species