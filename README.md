# Neon Clicker Game

A sci-fi themed active clicker game with upgrades, satellites, and a slot machine mechanic.

## Deployment

To deploy to Google Cloud Run, use the provided PowerShell script:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy.ps1
```

This script will:
1. Detect your active gcloud project configuration.
2. Build the Docker image using Cloud Build.
3. Deploy the image to Cloud Run (Region: asia-northeast1).
