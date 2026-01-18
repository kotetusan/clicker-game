# Release Notes

## v1.3.0 (2026-01-18)
- **Feature**: **Automation Overhaul**!
    - **Auto Bot v1**: Power increased by **5x** (1 → 5 MPS).
    - **Point Factory**: Power increased by **5x** (10 → 50 MPS).
    - **New Upgrade**: **Nanobot Swarm** (500 MPS)! A high-tier automation unit for late-game progress.
    - Improved cost balance for automation upgrades to ensure idle play is a viable strategy.

## v1.2.2 (2026-01-18)
- **Balance**: Implemented **Dynamic Prestige Rewards**.
    - Prestige Points (PP) are now calculated as `Rank - 30`.
    - This scales linearly: Rank 40 = 10 PP, Rank 50 = 20 PP, Rank 60 = 30 PP.
    - Provides a strong incentive to reach higher Ranks before resetting.
- **UI**: Prestige confirmation modal now displays the exact amount of PP earned.

## v1.2.1 (2026-01-18)
- **Fix**: Resolved layout issue where the Prestige Shop was invisible (pushed off-screen by the standard upgrade list) [Issue #2].

## v1.2.0 (2026-01-18)
- **Balance**:
    - Lowered Prestige unlock requirement from Rank 100 to **Rank 40**.
    - Increased max level caps for all upgrades (e.g., Click Booster to Lv 100, Auto Bot to Lv 200).
    - Reduced cost scaling for high-tier upgrades (Flux Matrix, Precision Lens).
- **Fix**: Corrected "MAX" cost display for maxed-out upgrades [Issue #1].

## v1.1.5 (2026-01-18)
- **Fix**: Resolved visual bug where Slot Machine numbers were invisible in the final result.
- **Improvement**: Added `.gitignore` and `.dockerignore`.
- **Improvement**: Optimized `Dockerfile` for better build caching and asset handling.

## v1.1.4 (2026-01-16)
- Initial deployment configuration for Google Cloud Run.
- Added `cloudbuild.yaml` and `deploy.ps1`.
