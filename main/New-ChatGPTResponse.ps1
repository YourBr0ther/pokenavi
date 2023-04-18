Clear-Host

$OPENAI_API_KEY = Get-Content -Path ".\api.txt"

function New-ChatGPTPrompt {
    param (
        [Parameter(Mandatory = $false)]
        [string]$prompt,
        [bool]$firstRun
    )

    if ($firstRun) {$prompt = Get-Content -path ".\Charmeleon_string.txt"}

    $Headers = @{
        "Content-Type"  = "application/json"
        "Authorization" = "Bearer $($OPENAI_API_KEY)"

    }
    $Body = @{
        "model"       = "gpt-3.5-turbo"
        "messages"    = @(@{
                "role"    = "user"
                "content" = "$prompt"
            })
        "temperature" = 0.7
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "https://api.openai.com/v1/chat/completions" -Method "POST" -Headers $Headers -Body $Body

    if ($firstRun) { return $($response.Content | ConvertFrom-Json).choices.message.content } else { return $($response.Content | ConvertFrom-Json).choices.message.content}

}

New-ChatGPTPrompt -firstRun $true

do {
    $prompt = Read-Host "Q:"

    if ($prompt -ne "Good Night") {
        $completion = New-ChatGPTPrompt -prompt $prompt
        Write-Output $completion
    }
} until ($prompt -eq "Good Night")