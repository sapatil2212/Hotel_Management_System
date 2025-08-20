# PowerShell script to mark all migrations as applied
$migrations = @(
    "20250117000001_fix_avatar_url_type",
    "20250811063352_init", 
    "20250811105800_add_legal_fields",
    "20250811130933_add_available_for_booking_to_rooms",
    "20250811140314_add_branding_fields",
    "20250811160846_add_enhanced_billing_system",
    "20250811162632_fix_updated_at_fields",
    "20250811171314_add_bank_account_system",
    "20250814075700_add_actual_checkout_timenpx",
    "20250816120804_add_notifications_table"
)

foreach ($migration in $migrations) {
    Write-Host "Marking migration $migration as applied..."
    npx prisma migrate resolve --applied $migration
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migration $migration marked as applied"
    } else {
        Write-Host "✗ Failed to mark migration $migration as applied"
    }
}

Write-Host "All migrations have been marked as applied!"
