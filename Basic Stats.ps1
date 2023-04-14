$FilePath = "D:\Downloads\005 - CHARMELEON - 3DDE25D07CE5.pk3"

if (-not (Test-Path $FilePath)) {
    Write-Error "File not found: $FilePath"
    return
}

# Get Pokemon Data
$pk3Data = [System.IO.File]::ReadAllBytes($FilePath)

# Get the Pokemon National Dex
$speciesIndex = [BitConverter]::ToUInt16($pk3Data, 32)
$trainerID = [BitConverter]::ToUInt16($pk3Data, 4)
$tempNickname = $pk3Data[8..17]
$tempTrainerName = $pk3Data[20..26]

switch ($pk3Data[18]) {

    '1' { $language = "Japanese" }
    '2' { $language =  "English" }
    '3' { $language =  "French" }
    '4' { $language =  "Italian" }
    '5' { $language =  "German" }
    '7' { $language = "Spanish" }

}

$gen3CharacterMap = @(
        ' ',  'À',  'Á',  'Â', 'Ç',  'È',  'É',  'Ê',  'Ë',  'Ì', 'こ', 'Î',  'Ï',  'Ò',  'Ó',  'Ô', 'Œ',  'Ù',  'Ú',  'Û', 'Ñ',  'ß',  'à',  'á',  'ね', 'Ç',  'È', 'é',  'ê',  'ë',  'ì',  'í', 'î',  'ï',  'ò',  'ó', 'ô',  'œ',  'ù',  'ú',  'û',  'ñ',  'º', 'ª',  '⒅', '&',  '+',  'あ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゃ', '=',  'ょ', 'が', 'ぎ', 'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど', 'ば', 'び', 'ぶ', 'べ', 'ぼ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ', 'っ', '¿',  '¡',  '⒆', '⒇', 'オ', 'カ', 'キ', 'ク', 'ケ', 'Í',  'コ', 'サ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ヌ', 'â',  'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ', 'í', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ヲ', 'ン', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ャ', 'ュ', 'ョ', 'ガ', 'ギ', 'グ', 'ゲ', 'ゴ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ', 'ダ', 'ヂ', 'ヅ', 'デ', 'ド', 'バ', 'ビ', 'ブ', 'ベ', 'ボ', 'パ', 'ピ', 'プ', 'ペ', 'ポ', 'ッ', '0',  '1',  '2',  '3',  '4',  '5',  '6',  '7',  '8',  '9',  '!', '?',  '.',  '-',  '・', '⑬',  '“',  '”',  '‘', '’',  '♂',  '♀',  '$',  ',',  '⑧',  '/',  'A', 'B',  'C',  'D',  'E', 'F',  'G',  'H',  'I','J',  'K',  'L',  'M',  'N',  'O',  'P',  'Q', 'R',  'S',  'T',  'U', 'V',  'W',  'X',  'Y', 'Z',  'a',  'b',  'c',  'd',  'e',  'f',  'g', 'h',  'i',  'j',  'k', 'l',  'm',  'n',  'o', 'p',  'q',  'r',  's',  't',  'u',  'v',  'w', 'x',  'y',  'z',  '0', ':',  'Ä',  'Ö',  'Ü', 'ä',  'ö',  'ü'
)

$nickname = ""
foreach ($nicknameLetter in $tempNickname) { $nickname += $gen3CharacterMap[$nicknameLetter-1] }

$trainerName = ""
foreach ($trainerLetter in $tempTrainerName) { $trainerName += $gen3CharacterMap[$trainerLetter-1] }


$fileContent = Get-Content -Path $FilePath -Encoding Byte
$personalityBytes = $fileContent[0..3] # Extract bytes 0-3
$personalityValue = [BitConverter]::ToUInt32($personalityBytes, 0)

function Get-PokemonData {
param (
        [Parameter(Mandatory=$true)]
        [string]$substructureOrder
    )

    $test = "CADB"

    # EVs & Condition

    # Growth

    # Miscellanous

    # Attacks


}


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

# Usage example:
$substructureOrder = Get-PK3SubstructureOrder -PersonalityValue $personalityValue



$pokemon = @{
 "Personality Value" = $personalityValue
 "Trainer ID" = [BitConverter]::ToUInt16($pk3Data, 4)
 "Nickname" = $nickname
 "Language" = $language
 "Egg Name" = $pk3Data[19]
 "Original Trainer Name" = $trainerName
 "Markings" = $pk3Data[27]

}

$substructureOrder

$data = Get-PokemonData -substructureOrder $substructureOrder

#$pokemon