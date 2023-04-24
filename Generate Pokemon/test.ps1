function Get-PokeDexEntries {

    param (
        [Parameter(Mandatory = $true)]
        [int]$id
    )

    $url = "https://pokeapi.co/api/v2/pokemon-species/$id"

    $response = Invoke-RestMethod -Uri $url -Method Get

    $flavortextArray = @()
    for ($i = 0; $i -le $response.flavor_text_entries.count; $i++) {
    
        if ($response.flavor_text_entries[$i].language.name -eq "en") {
            $flavorTextArray += ($response.flavor_text_entries[$i].flavor_text -replace "`r`n|`r|`n", " ").Trim()
        }
    
    
    }
    $flavorTextArray = $flavortextArray | Select-Object -Unique

    return $flavorTextArray

}

$entries = Get-PokeDexEntries -id 5

$entries