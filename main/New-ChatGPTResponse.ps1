Clear-Host

$OPENAI_API_KEY = Get-Content -Path ".\api.txt"

function New-ChatGPTPrompt {
    param (
        [Parameter(Mandatory = $false)]
        [string]$prompt,
        [array]$history
    )

    $Headers = @{
        "Content-Type"  = "application/json"
        "Authorization" = "Bearer $($OPENAI_API_KEY)"
    }
    $Body = @{
        "model"       = "gpt-3.5-turbo"
        "messages"    = $history + @(@{
                "role"    = "user"
                "content" = "$prompt"
            })
        "temperature" = 0.7
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "https://api.openai.com/v1/chat/completions" -Method "POST" -Headers $Headers -Body $Body

    return $($response.Content | ConvertFrom-Json).choices.message.content
}

$conversationHistory = @(@{
    "role" = "system"
    "content" = Get-Content -path ".\Charmeleon_string.txt"
})

do {
    $prompt = Read-Host "Q"
    $conversationHistory += @(@{
        "role" = "user"
        "content" = $prompt
    })

    if ($prompt -ne "Good Night") {
        $completion = New-ChatGPTPrompt -prompt $prompt -history $conversationHistory
        Write-Output "A: $completion"
        Write-Host ""
        $conversationHistory += @(@{
            "role" = "assistant"
            "content" = $completion
        })
    }
} until ($prompt -eq "Good Night")
