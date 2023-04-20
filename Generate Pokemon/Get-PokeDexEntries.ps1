function Get-PokemonStats {

    param (
        [Parameter(Mandatory = $true)]
        [int]$id
    )

    $url = "https://pokeapi.co/api/v2/pokemon-species/$id"

    $response = Invoke-RestMethod -Uri $url -Method Get



    return $response

}

$results = Get-PokemonStats -id 5

$flavortextArray = @()
for ($i = 0; $i -le $results.flavor_text_entries.count; $i++) {

    if ($results.flavor_text_entries[$i].language.name -eq "en") {
        $flavorTextArray += ($results.flavor_text_entries[$i].flavor_text -replace "`r`n|`r|`n", " ").Trim()
    }


}
$flavorTextArray = $flavortextArray | Select-Object -Unique

$testStriing = ($flavorTextArray[0] -split "`r`n|`r|`n" -join " ").Trim()
$testStriing