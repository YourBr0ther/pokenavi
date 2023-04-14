
# INITALIZATION
Clear-Host
$scriptLocation = "C:\Scripts\PokeNavi"
Set-Location -Path $scriptLocation

# Create proper name casing
$culture = [System.Globalization.CultureInfo]::CurrentCulture

# FUNCTIONs
function Get-PokemonStats {

    param (
        [Parameter(Mandatory = $true)]
        [int]$id
    )

    $url = "https://pokeapi.co/api/v2/pokemon/$id"

    $response = Invoke-RestMethod -Uri $url -Method Get

    return $response

}

# Get the Substructure Order
function Get-PK3SubstructureOrder {
    param (
        [Parameter(Mandatory=$true)]
        [uint32]$PersonalityValue
    )

    $order = $PersonalityValue % 4
    $permutations = @(
        "ABCD", "ABDC", "ACBD", "ACDB", "ADBC", "ADCB",
        "BACD", "BADC", "BCAD", "BCDA", "BDAC", "BDCA",
        "CABD", "CADB", "CBAD", "CBDA", "CDAB", "CDBA",
        "DABC", "DACB", "DBAC", "DBCA", "DCAB", "DCBA"
    )

    return $permutations[$order]
}

# START SCRIPT BODY
try {
    $pokemonExport = ".\testing\Char.pk3"
    if (Test-Path -Path $pokemonExport) { Write-Host "Pokemon exist. Importing now" } else { Write-Host "There was a problem importing the Pokemon" } 
    $pk3Data = [System.IO.File]::ReadAllBytes($pokemonExport)
}
catch { break }

# Get all of the "normalize values from Pokemon API"
$speciesIndex = [BitConverter]::ToUInt16($pk3Data, 32)

$stats = Get-PokemonStats -id $speciesIndex

$s = [ordered]@{

    NationalPokedexNumber = $stats.id
    Species               = $culture.TextInfo.ToTitleCase($stats.species.name)
    Type1                 = $stats.types.type.name
    Type2                 = ""

}

#$tempNickname = $pk3Data[8..17]
#$tempTrainerName = $pk3Data[20..26]
# $gen3CharacterMap = @(
#     ' ', 'À', 'Á', 'Â', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'こ', 'Î', 'Ï', 'Ò', 'Ó', 'Ô', 'Œ', 'Ù', 'Ú', 'Û', 'Ñ', 'ß', 'à', 'á', 'ね', 'Ç', 'È', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ò', 'ó', 'ô', 'œ', 'ù', 'ú', 'û', 'ñ', 'º', 'ª', '⒅', '&', '+', 'あ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゃ', '=', 'ょ', 'が', 'ぎ', 'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど', 'ば', 'び', 'ぶ', 'べ', 'ぼ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ', 'っ', '¿', '¡', '⒆', '⒇', 'オ', 'カ', 'キ', 'ク', 'ケ', 'Í', 'コ', 'サ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ヌ', 'â', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ', 'í', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ヲ', 'ン', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ャ', 'ュ', 'ョ', 'ガ', 'ギ', 'グ', 'ゲ', 'ゴ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ', 'ダ', 'ヂ', 'ヅ', 'デ', 'ド', 'バ', 'ビ', 'ブ', 'ベ', 'ボ', 'パ', 'ピ', 'プ', 'ペ', 'ポ', 'ッ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '?', '.', '-', '・', '⑬', '“', '”', '‘', '’', '♂', '♀', '$', ',', '⑧', '/', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', ':', 'Ä', 'Ö', 'Ü', 'ä', 'ö', 'ü'
# )
# $nickname = ""
# foreach ($nicknameLetter in $tempNickname) { $nickname += $gen3CharacterMap[$nicknameLetter - 1] }
# $trainerName = ""
# foreach ($trainerLetter in $tempTrainerName) { $trainerName += $gen3CharacterMap[$trainerLetter - 1] }

$personalityValue = [BitConverter]::ToUInt32($($pk3Data[0..3]), 0)
$substructureOrder = Get-PK3SubstructureOrder -PersonalityValue $personalityValue

Write-Host "Order: $substructureOrder"

$data = $pk3Data[31..81]

$i = 0
foreach ($letter in [char[]]$substructureOrder) {

    if ($letter -eq "A") { $gOffset = $i  }
    if ($letter -eq "B") { $aOffset = $i  }
    if ($letter -eq "C") { $eOffset = $i  }
    if ($letter -eq "D") { $mOffset = $i  }

    $i++
}

Write-Host "Growth: $gOffset"
Write-Host "Attack: $aOffset"
Write-Host "EVs: $eOffset"
Write-Host "Misc: $mOffset"



# PV
# Get the Data set
# Determine the order
# determine the finder offset

# for position 1, it is A, so A's offset is 0
# for position 2, it is C, so C's offset is 13
# for position 3, it is D, so D's office is 27
# for position 4, it is B, so B's offset is 30




$pokemon = [PSCustomObject]@{
    NationalPokedexNumber = $s.NationalPokedexNumber
    Species               = $s.Species
    Type1                 = $s.Type1
    Type2                 = $s.Type2
    BaseStats             = @{
        HP             = 0
        Attack         = 0
        Defense        = 0
        SpecialAttack  = 0
        SpecialDefense = 0
        Speed          = 0
    }
    Abilities             = @('', '')
    Moves                 = @('', '', '', '')
    Level                 = $pk3Data[84]
    ExperiencePoints      = 0
    IndividualValues      = @{
        HP             = 0
        Attack         = 0
        Defense        = 0
        SpecialAttack  = 0
        SpecialDefense = 0
        Speed          = 0
    }
    EffortValues          = @{
        HP             = 0
        Attack         = 0
        Defense        = 0
        SpecialAttack  = 0
        SpecialDefense = 0
        Speed          = 0
    }
    Nature                = ''
    HeldItem              = ''
    Gender                = ''
    OriginalTrainer       = @{
        Name      = $trainerName
        TrainerID = [BitConverter]::ToUInt16($pk3Data, 4)
        SecretID  = 0
    }
    Friendship            = 0
    Nickname              = $nickname
    ShinyStatus           = $false
    BallCaught            = ''
    Ribbons               = @('', '')
    Markings              = @('', '')
}

#$pokemon