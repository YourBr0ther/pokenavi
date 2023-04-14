Clear-Host

function Query-ChatGPT {
    param(
        [string]$apiKey,
        [string]$prompt,
        [int]$maxTokens = 50,
        [double]$temperature = 0.5
    )

    $baseUrl = "https://api.openai.com/v1/chat/completions"

    # Set up the request headers
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $apiKey"
    }

    # Set up the request body
    $body = @{
        prompt = $prompt
        max_tokens = $maxTokens
        temperature = $temperature
    } | ConvertTo-Json

    # Send the HTTP request and parse the response JSON
    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $headers -Body $body
    $completion = $response.choices[0].text

    # Output the completion
    Write-Output $completion
}

$promptFilePath = ".\Charmeleon_string.txt"
$prompt = Get-Content $promptFilePath -Raw

$apiKeyFilePath = ".\api.txt"
$apiKey = Get-Content $apiKeyFilePath -Raw

$completion = Query-ChatGPT -apiKey $apiKey -prompt $prompt
Write-Output $completion

do {
    $prompt = Read-Host "Enter your prompt:"

    if ($prompt -ne "Exit") {
        $completion = Query-ChatGPT -apiKey $apiKey -prompt $prompt
        Write-Output $completion
    }
} until ($prompt -eq "Exit")
