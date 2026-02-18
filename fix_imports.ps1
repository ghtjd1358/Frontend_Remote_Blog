$srcPath = 'C:\Coding\개인포트폴리오(Persnal)\mfa\remote2\src'
$files = Get-ChildItem -Path $srcPath -Recurse -Include '*.ts','*.tsx'
$updatedCount = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $newContent = $content

    # Handle double-level relative imports (../../) for files 2 levels deep
    # e.g. components/mypage/*.tsx or pages/admin/*.tsx -> ../../network, ../../hooks, etc.
    $newContent = $newContent -replace "from '\.\.\/\.\.\/network", "from '@/network"
    $newContent = $newContent -replace "from '\.\.\/\.\.\/hooks", "from '@/hooks"
    $newContent = $newContent -replace "from '\.\.\/\.\.\/components", "from '@/components"
    $newContent = $newContent -replace "from '\.\.\/\.\.\/utils", "from '@/utils"
    $newContent = $newContent -replace "from '\.\.\/\.\.\/config", "from '@/config"
    $newContent = $newContent -replace "from '\.\.\/\.\.\/pages", "from '@/pages"
    $newContent = $newContent -replace "from '\.\.\/\.\.\/network", "from '@/network"

    # Handle single-level relative imports (../) for files 1 level deep
    # e.g. hooks/*.ts, components/*.tsx -> ../network, ../hooks, etc.
    $newContent = $newContent -replace "from '\.\.\/network", "from '@/network"
    $newContent = $newContent -replace "from '\.\.\/hooks", "from '@/hooks"
    $newContent = $newContent -replace "from '\.\.\/components", "from '@/components"
    $newContent = $newContent -replace "from '\.\.\/utils", "from '@/utils"
    $newContent = $newContent -replace "from '\.\.\/config", "from '@/config"
    $newContent = $newContent -replace "from '\.\.\/pages", "from '@/pages"

    # Handle ../common in network/apis/*/*.ts (one level up from subdir = network/apis/common)
    $newContent = $newContent -replace "from '\.\.\/common", "from '@/network/apis/common"

    # Handle ../supabase in network/apis/common.ts (one level up from apis/ = network/supabase)
    $newContent = $newContent -replace "from '\.\.\/supabase", "from '@/network/supabase"

    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Updated: $($file.FullName)"
        $updatedCount++
    }
}
Write-Host "Total updated: $updatedCount"
