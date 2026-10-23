param([ValidateSet('start', 'stop')][string]$Action = 'start')

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$dataDirectory = Join-Path $projectRoot '.local/postgres'
$pgCtl = 'C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe'
if (-not (Test-Path $pgCtl)) { throw 'PostgreSQL 18 is required for this local database command.' }
if (-not (Test-Path (Join-Path $dataDirectory 'PG_VERSION'))) {
    throw 'The local database has not been initialized. See README.md for the Docker setup alternative.'
}
& $pgCtl -D $dataDirectory status
$isRunning = $LASTEXITCODE -eq 0
if ($Action -eq 'start' -and -not $isRunning) {
    & $pgCtl -D $dataDirectory -l (Join-Path $projectRoot '.local/postgres.log') -o '-p 5433 -h localhost' start
    if ($LASTEXITCODE -ne 0) { throw 'Could not start the local database.' }
} elseif ($Action -eq 'stop' -and $isRunning) {
    & $pgCtl -D $dataDirectory -m fast stop
    if ($LASTEXITCODE -ne 0) { throw 'Could not stop the local database.' }
}
exit 0
