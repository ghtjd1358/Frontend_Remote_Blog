$testFile = 'C:\Coding\개인포트폴리오(Persnal)\mfa\remote2\src\network\apis\category\get-categories.ts'
try {
    $content = Get-Content -Path $testFile -Raw -Encoding UTF8
    Write-Host "Got content, length: $($content.Length)"
    Write-Host "First 200 chars: $($content.Substring(0, [Math]::Min(200, $content.Length)))"
    Write-Host "Contains from '../common':" ($content -match "from '\.\./common")
} catch {
    Write-Host "Error: $_"
}
