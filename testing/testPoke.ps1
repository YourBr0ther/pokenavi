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