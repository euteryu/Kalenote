$dbPath = "$env:APPDATA\kalenote\kalenote.db"

Write-Host "Deleting Kalenote database..." -ForegroundColor Yellow

if (Test-Path $dbPath) {
    Remove-Item -Force $dbPath
    Write-Host "Database deleted successfully!" -ForegroundColor Green
} else {
    Write-Host "Database not found (already deleted or never created)" -ForegroundColor Cyan
}

Write-Host "`nDatabase will be recreated on next app start." -ForegroundColor White
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
