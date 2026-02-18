$testFile = 'C:\Coding\개인포트폴리오(Persnal)\mfa\remote2\src\network\apis\category\get-categories.ts'
$content = [System.IO.File]::ReadAllText($testFile, [System.Text.Encoding]::UTF8)
Write-Host "File content:"
Write-Host $content
Write-Host "---"
Write-Host "Contains '../common':" ($content -match "\.\./common")
Write-Host "Contains from '../common':" ($content -match "from '\.\./common")
Write-Host "Line by line:"
$lines = $content -split "`n"
foreach ($line in $lines) {
    if ($line.Trim() -ne '') {
        Write-Host "LINE: [$line]"
    }
}
