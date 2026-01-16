# Usage: powershell -ExecutionPolicy Bypass -File .\deploy.ps1
# Check if gcloud is in PATH, if not try to add common paths
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "gcloud not found in PATH. Searching common locations..." -ForegroundColor Yellow
    
    $commonPaths = @(
        "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin",
        "$env:ProgramFiles(x86)\Google\Cloud SDK\google-cloud-sdk\bin",
        "$env:ProgramFiles\Google\Cloud SDK\google-cloud-sdk\bin"
    )

    foreach ($path in $commonPaths) {
        if (Test-Path "$path\gcloud.cmd") {
            Write-Host "Found gcloud at: $path" -ForegroundColor Green
            $env:PATH = "$path;$env:PATH"
            break
        }
    }
}

# Verify again
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Error "gcloud command not found! Please install Google Cloud SDK or add it to your PATH."
    exit 1
}

# Fetch active project ID from gcloud config
$PROJECT_ID = gcloud config get-value project 2> $null
if (-not $PROJECT_ID) {
    Write-Error "Could not determine active Google Cloud Project ID."
    Write-Host "Please run: gcloud config set project [YOUR_PROJECT_ID]" -ForegroundColor Yellow
    exit 1
}

$SERVICE_NAME = "clicker-game"
$REGION = "asia-northeast1"
$IMAGE_TAG = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

$SA_NAME = "clicker-game-sa"
$SA_EMAIL = "$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Check if Service Account exists, create if not
$saExists = gcloud iam service-accounts list --filter="email:$SA_EMAIL" --format="value(email)" --project $PROJECT_ID
if (-not $saExists) {
    Write-Host "Creating service account $SA_NAME..." -ForegroundColor Yellow
    gcloud iam service-accounts create $SA_NAME --display-name "Service Account for Clicker Game" --project $PROJECT_ID --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create service account!"
        exit 1
    }
}
else {
    Write-Host "Using existing service account: $SA_EMAIL" -ForegroundColor Cyan
}

Write-Host "Using Project ID: $PROJECT_ID" -ForegroundColor Cyan

Write-Host "Starting build..." -ForegroundColor Green
gcloud builds submit --tag $IMAGE_TAG --project $PROJECT_ID --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed!"
    exit 1
}

Write-Host "Deploying to Cloud Run..." -ForegroundColor Green
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_TAG `
    --project $PROJECT_ID `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --memory 256Mi `
    --cpu 1 `
    --max-instances 10 `
    --service-account $SA_EMAIL `
    --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed!"
    exit 1
}

Write-Host "Deployment Completed Successfully!" -ForegroundColor Cyan
