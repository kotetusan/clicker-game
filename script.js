class ClickerGame {
    constructor() {
        // Game State
        this.score = 0;
        this.totalClicks = 0;
        this.startTime = Date.now();

        // Upgrades Configuration
        this.upgrades = [
            {
                id: 'click_power',
                name: 'Click Booster',
                baseCost: 15,
                costMultiplier: 1.5,
                basePower: 1, // Adds to click strength
                type: 'click',
                desc: 'Increases points per click.',
                level: 0,
                maxLevel: 100
            },
            {
                id: 'auto_clicker_basic',
                name: 'Auto Bot v1',
                baseCost: 100,
                costMultiplier: 1.15,
                basePower: 5, // Buffed: 1 -> 5
                type: 'auto',
                desc: 'Automatically clicks 5 times per second.',
                level: 0,
                maxLevel: 200
            },
            {
                id: 'auto_factory',
                name: 'Point Factory',
                baseCost: 1000,
                costMultiplier: 1.2,
                basePower: 50, // Buffed: 10 -> 50
                type: 'auto',
                desc: 'A small factory generating 50 points/sec.',
                level: 0,
                maxLevel: 200
            },
            {
                id: 'auto_swarm',
                name: 'Nanobot Swarm',
                baseCost: 25000,
                costMultiplier: 1.3,
                basePower: 500, // New Tier
                type: 'auto',
                desc: 'A swarm of nanobots generating 500 points/sec.',
                level: 0,
                maxLevel: 100
            },
            {
                id: 'multiplier_matrix',
                name: 'Flux Matrix',
                baseCost: 5000,
                costMultiplier: 1.8,
                basePower: 0, // Special logic could go here, for now just global multiplier? Or huge click boost
                type: 'click_mult',
                desc: 'Doubles your click power efficiency.',
                level: 0,
                maxLevel: 20
            },
            {
                id: 'crit_chance',
                name: 'Precision Lens',
                baseCost: 500,
                costMultiplier: 1.4,
                basePower: 0.01, // +1% per level
                type: 'crit_chance',
                desc: '+1% Critical Hit Chance',
                level: 0,
                maxLevel: 50
            },
            {
                id: 'crit_power',
                name: 'Plasma Charge',
                baseCost: 1000,
                costMultiplier: 1.5,
                basePower: 0.01, // +1% per level
                type: 'crit_power',
                desc: '+1% Critical Multiplier',
                level: 0,
                maxLevel: 50
            }
        ];

        // Calculated stats
        this.clickStrength = 1;
        this.pointsPerSecond = 0;
        this.rank = 1;
        this.criticalChance = 0;
        this.criticalMultiplier = 2;

        // Prestige Data
        this.prestigeCount = 0;
        this.prestigePoints = 0;
        this.goldStreak = 0; // Track consecutive gold button clicks
        this.prestigeUpgrades = [
            { id: 'pp_mult_1', name: 'Cosmic Power', type: 'prestige_mult', baseCost: 10, basePower: 0.5, costMultiplier: 2, level: 0, maxLevel: 10, desc: '+50% Global Multiplier' },
            { id: 'pp_luck_1', name: 'Golden Luck', type: 'prestige_luck', baseCost: 25, basePower: 1, costMultiplier: 3, level: 0, maxLevel: 5, desc: 'Better Gold Button Luck (Not Implemented Yet)' }
        ];

        // DOM Elements
        this.elScore = document.getElementById('score-display');
        this.elMps = document.getElementById('mps-display');
        this.elBtn = document.getElementById('main-button');
        this.elUpgradeList = document.getElementById('upgrade-list');
        this.elRank = document.getElementById('rank-display');
        this.elProgress = document.getElementById('rank-progress');
        this.elReset = document.getElementById('reset-btn');
        this.elSatelliteContainer = document.getElementById('satellite-container');
        this.elBuffIndicator = document.getElementById('buff-indicator');
        this.elPrestigeBtn = document.getElementById('prestige-btn');
        this.elPpDisplay = document.getElementById('pp-display');
        this.elPpValue = document.getElementById('pp-value');
        this.elPrestigeShop = document.getElementById('prestige-shop');
        this.elPrestigeUpgradeList = document.getElementById('prestige-upgrade-list');
        this.elBuffIndicator = document.getElementById('buff-indicator');

        this.globalMultiplier = 1;

        this.init();
    }

    init() {
        this.loadGame();
        this.calculateStats();
        this.setupEvents();
        this.renderUpgrades();
        this.startGameLoop();
        this.startGoldenButtonLoop();
        this.initParticles();
        this.renderSatellites(); // Ensure satellites render on startup/reset
        this.checkRankUp(); // Initialize Rank UI based on loaded upgrades
    }

    initParticles() {
        if (window.particlesJS) {
            particlesJS('particles-js', {
                "particles": {
                    "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                    "color": { "value": "#ffffff" },
                    "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" }, "polygon": { "nb_sides": 5 } },
                    "opacity": { "value": 0.5, "random": false, "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false } },
                    "size": { "value": 3, "random": true, "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false } },
                    "line_linked": { "enable": true, "distance": 150, "color": "#00f2ff", "opacity": 0.2, "width": 1 },
                    "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "min_speed": 1, "straight": false, "out_mode": "out", "bounce": false, "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 } }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                    "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } }, "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 }, "repulse": { "distance": 200, "duration": 0.4 }, "push": { "particles_nb": 4 }, "remove": { "particles_nb": 2 } }
                },
                "retina_detect": true
            });
        }
    }

    setupEvents() {
        this.elBtn.addEventListener('mousedown', (e) => this.handleClick(e));
        // Prevent double firing on touch devices if needed, but simple click is usually fine

        this.elReset.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress?')) {
                this.resetGame();
            }
        });

        // Prestige Listeners
        if (this.elPrestigeBtn) {
            this.elPrestigeBtn.addEventListener('click', () => {
                document.getElementById('prestige-modal').style.display = 'flex';
            });
        }

        const btnCancel = document.getElementById('cancel-prestige');
        if (btnCancel) btnCancel.addEventListener('click', () => {
            document.getElementById('prestige-modal').style.display = 'none';
        });

        const btnConfirm = document.getElementById('confirm-prestige');
        if (btnConfirm) btnConfirm.addEventListener('click', () => {
            this.doPrestige();
        });

        // Mobile Menu Logic
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileCloseBtn = document.getElementById('mobile-menu-close-btn');
        const shopZone = document.querySelector('.shop-zone');
        const overlay = document.getElementById('overlay'); // Assuming an overlay element exists
        const settingsModal = document.getElementById('settings-modal'); // Assuming settings modal exists

        const toggleMobileMenu = () => {
            shopZone.classList.toggle('open');
            // overlay.style.display = shopZone.classList.contains('open') ? 'block' : 'none'; // Removed: causing dark screen issue

            // Prevent body scroll when menu is open
            if (shopZone.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
                // Also close settings modal if open
                if (settingsModal) settingsModal.style.display = 'none';
            } else {
                document.body.style.overflow = '';
            }
        }

        if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', () => {
            if (settingsModal) settingsModal.style.display = 'flex';
        });

        // Close menu when clicking overlay
        if (overlay) overlay.addEventListener('click', () => {
            if (shopZone.classList.contains('open')) {
                toggleMobileMenu();
            }
            // Also close settings modal
            if (settingsModal) settingsModal.style.display = 'none';
        });

        // PC Menu & Settings Modal
        const pcMenuBtn = document.getElementById('pc-menu-btn');
        const closeSettingsBtn = document.getElementById('close-settings-btn');

        if (pcMenuBtn && settingsModal && closeSettingsBtn) {
            pcMenuBtn.addEventListener('click', () => {
                settingsModal.style.display = 'flex';
                // Close mobile menu if open
                if (shopZone.classList.contains('open')) {
                    toggleMobileMenu();
                }
            });

            closeSettingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'none';
            });

            // Close on clicking outside content
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    settingsModal.style.display = 'none';
                }
            });
        }
    }

    handleClick(e) {
        // Calculate effective points for display
        let effectivePoints = this.clickStrength * this.globalMultiplier;
        let isCritical = false;

        // Critical Hit Logic
        if (Math.random() < this.criticalChance) {
            effectivePoints *= this.criticalMultiplier;
            isCritical = true;
        }

        // Add points (addPoints handles multiplication internally, so we need to bypass it or adjust)
        // Wait, addPoints multiplies by globalMultiplier again! 
        // Let's refactor addPoints to take FINAL amount or adjust logic.
        // Current: addPoints(amount) -> amount * global
        // We want: (Strength * Crit) * Global
        // So we pass (Strength * Crit) to addPoints

        // Actually, let's just do logic here properly:
        const amountToAdd = isCritical ? (this.clickStrength * this.criticalMultiplier) : this.clickStrength;

        this.addPoints(amountToAdd);
        this.totalClicks++;

        // Visual Effect
        const isGold = this.globalMultiplier > 1;

        if (isCritical) {
            this.spawnFloatingText(e.clientX, e.clientY, `CRITICAL! +${this.formatNumber(amountToAdd * this.globalMultiplier)}`, false, true);
        } else {
            this.spawnFloatingText(e.clientX, e.clientY, `+${this.formatNumber(amountToAdd * this.globalMultiplier)}`, isGold);
        }
    }

    addPoints(amount) {
        this.score += amount * this.globalMultiplier;
        this.updateUI();
        this.checkRankUp();
    }

    buyUpgrade(upgradeId) {
        const upgrade = this.upgrades.find(u => u.id === upgradeId);
        if (!upgrade) return;

        const cost = this.getCost(upgrade);
        if (this.score >= cost && upgrade.level < upgrade.maxLevel) {
            this.score -= cost;
            upgrade.level++;
            this.calculateStats();
            this.renderUpgrades();
            this.updateUI();
            this.saveGame();
            if (upgrade.type === 'auto') {
                this.renderSatellites();
            }
        }
    }

    getCost(upgrade) {
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    }

    calculateStats() {
        this.clickStrength = 1;
        this.pointsPerSecond = 0;
        this.criticalChance = 0;
        this.criticalMultiplier = 2.0;

        this.upgrades.forEach(u => {
            if (u.level > 0) {
                if (u.type === 'click') {
                    this.clickStrength += u.basePower * u.level;
                } else if (u.type === 'auto') {
                    this.pointsPerSecond += u.basePower * u.level;
                } else if (u.type === 'click_mult') {
                    this.clickStrength *= Math.pow(2, u.level);
                } else if (u.type === 'crit_chance') {
                    this.criticalChance += u.basePower * u.level;
                } else if (u.type === 'crit_power') {
                    this.criticalMultiplier += u.basePower * u.level;
                }
            }
        });
    }

    checkRankUp() {
        const totalLevels = this.upgrades.reduce((acc, u) => acc + u.level, 0);
        this.rank = Math.min(100, Math.floor(totalLevels / 5) + 1);
        const progress = (totalLevels % 5) / 5 * 100;
        this.elRank.textContent = this.rank;
        this.elProgress.style.width = `${progress}%`;

        // Prestige Trigger
        if (this.rank >= 40) {
            this.elPrestigeBtn.style.display = 'block';
            this.updatePrestigeModalText(); // Update modal text
        } else {
            this.elPrestigeBtn.style.display = 'none';
        }
    }

    getPrestigeReward() {
        return Math.max(0, this.rank - 30);
    }

    updatePrestigeModalText() {
        const reward = this.getPrestigeReward();
        const elModalText = document.querySelector('#prestige-modal .modal-content p:nth-child(3)');
        if (elModalText) {
            elModalText.innerHTML = `You will gain <span style="color: #bc13fe; font-weight: bold;">${reward} Prestige Points</span>.`;
        }
    }

    doPrestige() {
        // Reset Logic
        const reward = this.getPrestigeReward();
        this.prestigeCount++;
        this.prestigePoints += reward;

        // Reset Standard Progress
        this.score = 0;
        this.rank = 1;
        this.totalClicks = 0;
        this.upgrades.forEach(u => u.level = 0);
        // Prestige Upgrades are PERSISTENT, so we don't reset them.

        // Cleanup visuals
        this.renderSatellites();
        document.getElementById('prestige-modal').style.display = 'none';

        // Save and Sync
        this.calculateStats();
        this.saveGame();
        this.renderUpgrades(); // Updates both standard and prestige lists
        this.checkRankUp(); // Reset Rank UI
        this.updateUI();

        alert(`PRESTIGE SUCCESSFUL!\nYou gained ${reward} Prestige Points!`);
    }

    // Update Calculate Stats for Prestige Multiplier
    calculateStats() {
        this.clickStrength = 1;
        this.pointsPerSecond = 0;
        this.criticalChance = 0;
        this.criticalMultiplier = 2.0;

        // Base Stats
        this.upgrades.forEach(u => {
            if (u.level > 0) {
                if (u.type === 'click') {
                    this.clickStrength += u.basePower * u.level;
                } else if (u.type === 'auto') {
                    this.pointsPerSecond += u.basePower * u.level;
                } else if (u.type === 'click_mult') {
                    this.clickStrength *= Math.pow(2, u.level);
                } else if (u.type === 'crit_chance') {
                    this.criticalChance += u.basePower * u.level;
                } else if (u.type === 'crit_power') {
                    this.criticalMultiplier += u.basePower * u.level;
                }
            }
        });

        // Prestige Multiplier
        let prestigeMult = 1;
        this.prestigeUpgrades.forEach(u => {
            if (u.id === 'pp_mult_1' && u.level > 0) {
                prestigeMult += u.basePower * u.level;
            }
        });

        // Apply Prestige Mult to everything
        this.clickStrength *= prestigeMult;
        this.pointsPerSecond *= prestigeMult;
    }

    // Modify RenderUpgrades to include Prestige Shop
    renderUpgrades() {
        const container = document.getElementById('upgrade-list');
        container.innerHTML = '';

        this.upgrades.forEach(upgrade => {
            // ... (existing helper or inline logic)
            // Let's refactor upgrade rendering to a helper to reuse for prestige
            container.appendChild(this.createUpgradeElement(upgrade));
        });

        // Prestige Shop
        if (this.prestigeCount > 0 || this.prestigePoints > 0) {
            this.elPrestigeShop.style.display = 'flex';
            this.elPpDisplay.style.display = 'block';

            const pContainer = this.elPrestigeUpgradeList;
            pContainer.innerHTML = '';

            this.prestigeUpgrades.forEach(upgrade => {
                pContainer.appendChild(this.createUpgradeElement(upgrade, true));
            });
        }
    }

    createUpgradeElement(upgrade, isPrestige = false) {
        const cost = this.getCost(upgrade);
        const el = document.createElement('div');
        el.className = 'upgrade-item' + (isPrestige ? ' prestige' : '');
        el.id = `btn-${upgrade.id}`; // CRITICAL: Fix ID so updateUI can find it

        // Check affordability
        const currency = isPrestige ? this.prestigePoints : this.score;
        const canAfford = currency >= cost;
        const isMaxed = upgrade.level >= upgrade.maxLevel;

        if (currency < cost || isMaxed) {
            el.classList.add('disabled');
        }

        if (canAfford && !isMaxed) {
            el.classList.add('affordable');
        }

        el.onclick = () => {
            if (isPrestige) this.buyPrestigeUpgrade(upgrade.id);
            else this.buyUpgrade(upgrade.id);
        };

        el.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-name">${upgrade.name}</span>
                <span class="upgrade-level">Lv ${upgrade.level}</span>
            </div>
            <div class="upgrade-desc">${upgrade.desc}</div>
            <div class="upgrade-cost">${isMaxed ? 'MAX' : 'Cost: ' + this.formatNumber(cost) + (isPrestige ? ' PP' : '')}</div>
        `;
        return el;
    }

    buyPrestigeUpgrade(id) {
        const upgrade = this.prestigeUpgrades.find(u => u.id === id);
        if (!upgrade) return;
        const cost = this.getCost(upgrade);

        if (this.prestigePoints >= cost && upgrade.level < upgrade.maxLevel) {
            this.prestigePoints -= cost;
            upgrade.level++;
            this.calculateStats();
            this.renderUpgrades(); // Re-renders lists to update costs/affordability
            this.updateUI();
            this.saveGame();
        }
    }

    startGameLoop() {
        this.gameLoopInterval = setInterval(() => {
            if (this.pointsPerSecond > 0) {
                this.addPoints(this.pointsPerSecond);
                this.fireSatellites();
            }
            this.saveGame();
        }, 1000);
    }

    // ... (lines 440-600 omitted) ...



    updateUI() {
        this.elScore.textContent = this.formatNumber(Math.floor(this.score));
        if (this.elPpValue) this.elPpValue.textContent = this.prestigePoints;
        // Show effective MPS
        const effectiveMPS = this.pointsPerSecond * this.globalMultiplier;
        this.elMps.textContent = `${this.formatNumber(effectiveMPS)} / sec`;
        if (this.globalMultiplier > 1) {
            this.elMps.style.color = '#ffd700';
            this.elMps.textContent += ` (x${this.globalMultiplier}!)`;
        } else {
            this.elMps.style.color = ''; // Reset to CSS default (or explicit success color if needed)
            this.elMps.style.color = 'var(--success-color)';
        }

        // Update upgrade buttons availability
        // Check for ANY affordable upgrade (notification)
        let hasAffordable = false;

        // Standard Upgrades
        this.upgrades.forEach(u => {
            const btn = document.getElementById(`btn-${u.id}`);
            if (btn) {
                const cost = this.getCost(u);
                const canAfford = this.score >= cost;
                const isMaxed = u.level >= u.maxLevel;

                if (canAfford && !isMaxed) {
                    btn.classList.remove('disabled');
                    btn.classList.add('affordable');
                    hasAffordable = true;
                } else {
                    btn.classList.add('disabled');
                    btn.classList.remove('affordable');
                }
            }
        });

        // Prestige Upgrades
        this.prestigeUpgrades.forEach(u => {
            const btn = document.getElementById(`btn-${u.id}`);
            if (btn) {
                const cost = this.getCost(u);
                const canAfford = this.prestigePoints >= cost;
                const isMaxed = u.level >= u.maxLevel;

                if (canAfford && !isMaxed) {
                    btn.classList.remove('disabled');
                    btn.classList.add('affordable');
                } else {
                    btn.classList.add('disabled');
                    btn.classList.remove('affordable');
                }
            }
        });

        // Mobile notification toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
            if (hasAffordable) {
                mobileMenuBtn.classList.add('has-upgrade');
            } else {
                mobileMenuBtn.classList.remove('has-upgrade');
            }
        }
    }

    renderSatellites() {
        this.elSatelliteContainer.innerHTML = '';

        // 1. Basic Auto Bots (Satellites)
        const botUpgrade = this.upgrades.find(u => u.id === 'auto_clicker_basic');
        const botCount = Math.min(botUpgrade ? botUpgrade.level : 0, 24);

        for (let i = 0; i < botCount; i++) {
            this.spawnOrbitUnit(i, botCount, 'bot-satellite', 'laser-beam', -150, '90deg');
        }

        // 2. Point Factories (Space Stations)
        const factoryUpgrade = this.upgrades.find(u => u.id === 'auto_factory');
        const factoryCount = Math.min(factoryUpgrade ? factoryUpgrade.level : 0, 12); // Fewer stations

        for (let i = 0; i < factoryCount; i++) {
            // Offset angle so they don't align perfectly with satellites if counts match
            this.spawnOrbitUnit(i, factoryCount, 'bot-station', 'station-beam', -220, '90deg', 15);
        }
    }

    spawnOrbitUnit(index, total, unitClass, laserClass, radius, laserRot, angleOffset = 0) {
        if (total === 0) return;
        const angle = (360 / total) * index + angleOffset;
        const wrapper = document.createElement('div');
        wrapper.className = 'bot-satellite-wrapper';
        wrapper.style.transform = `rotate(${angle}deg)`;

        // Unit
        const unit = document.createElement('div');
        unit.className = unitClass;

        // Beam/Laser
        const beam = document.createElement('div');
        beam.className = laserClass;
        // Radius is negative (up), so laser goes from radius to 0
        beam.style.top = `${radius}px`;
        beam.style.left = '0px';
        beam.style.transform = `rotate(${laserRot})`;
        beam.style.transformOrigin = '0 0';

        wrapper.appendChild(unit);
        wrapper.appendChild(beam);
        this.elSatelliteContainer.appendChild(wrapper);
    }



    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toLocaleString();
    }

    saveGame() {
        const data = {
            score: this.score,
            upgrades: this.upgrades.map(u => ({ id: u.id, level: u.level })),
            // Prestige Data
            prestigeCount: this.prestigeCount,
            prestigePoints: this.prestigePoints,
            prestigeUpgrades: this.prestigeUpgrades.map(u => ({ id: u.id, level: u.level })),
            startTime: this.startTime
        };
        localStorage.setItem('clickerGameSave', JSON.stringify(data));
    }

    loadGame() {
        const saved = localStorage.getItem('clickerGameSave');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.score = data.score || 0;
                this.startTime = data.startTime || Date.now();

                // Prestige Load
                this.prestigeCount = data.prestigeCount || 0;
                this.prestigePoints = data.prestigePoints || 0;

                if (data.upgrades) {
                    data.upgrades.forEach(savedU => {
                        const u = this.upgrades.find(localU => localU.id === savedU.id);
                        if (u) {
                            u.level = savedU.level;
                        }
                    });
                }

                if (data.prestigeUpgrades) {
                    data.prestigeUpgrades.forEach(savedU => {
                        const u = this.prestigeUpgrades.find(localU => localU.id === savedU.id);
                        if (u) {
                            u.level = savedU.level;
                        }
                    });
                }

                this.calculateStats(); // Ensure stats reflect loaded data immediately
                this.renderSatellites(); // Render loaded bots
            } catch (e) {
                console.error("Save file corrupted, resetting.");
            }
        }
    }

    resetGame() {
        if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
        localStorage.removeItem('clickerGameSave'); // Use consistent key
        location.reload();
    }

    startGoldenButtonLoop() {
        const scheduleNext = () => {
            // Random interval between 60s and 120s (1 to 2 minutes)
            const delay = Math.random() * 60000 + 60000;
            setTimeout(() => {
                this.spawnGoldenButton();
                scheduleNext();
            }, delay);
        };
        scheduleNext();
    }

    spawnGoldenButton() {
        // Prevent spawn if already exists OR if any Rush is active
        if (document.querySelector('.golden-button')) return;
        if (document.querySelector('.silver-button')) return;
        if (document.querySelector('.super-golden-button')) return;
        if (this.globalMultiplier > 1) return;

        // Check for Super Gold Trigger (5 streak)
        if (this.goldStreak >= 5) {
            this.spawnSuperGoldenButton();
            return;
        }

        const btn = document.createElement('div');
        btn.className = 'golden-button';
        btn.textContent = 'GOLD';

        // Random Position
        const x = Math.random() * 80 + 10;
        const y = Math.random() * 80 + 10;
        btn.style.left = `${x}%`;
        btn.style.top = `${y}%`;

        let isClicked = false;

        // Click Handler
        btn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isClicked = true;
            this.goldStreak++; // Increment streak
            // Update Streak Display
            const streakDisplay = document.getElementById('streak-display');
            if (streakDisplay) {
                streakDisplay.textContent = `Streak: ${this.goldStreak}`;
                streakDisplay.style.display = 'block';
            }

            if (btn.dataset.intervalId) clearInterval(btn.dataset.intervalId);
            this.showSlotMachine(); // Standard Gold Reward
            btn.remove();
        });

        document.querySelector('.app-container').appendChild(btn);

        // Move randomly
        const moveInterval = setInterval(() => {
            const newX = Math.random() * 80 + 10;
            const newY = Math.random() * 80 + 10;
            btn.style.left = `${newX}%`;
            btn.style.top = `${newY}%`;
        }, 700);

        btn.dataset.intervalId = moveInterval;

        // Despawn logic (Missed)
        setTimeout(() => {
            clearInterval(moveInterval);
            if (btn.parentNode) {
                if (!isClicked) {
                    this.goldStreak = 0; // Reset streak on miss
                    // Update Streak Display
                    const streakDisplay = document.getElementById('streak-display');
                    if (streakDisplay) {
                        streakDisplay.textContent = `Streak: 0`;
                        streakDisplay.style.display = 'none'; // Hide or keep visible? User "display streak". Maybe keep 0? Or hide. Usually hide 0.
                    }

                    btn.remove();
                    // Schedule Silver Button
                    setTimeout(() => this.spawnSilverButton(), 2000 + Math.random() * 3000); // 2-5s delay
                }
            }
        }, 5000);
    }

    spawnSuperGoldenButton() {
        const btn = document.createElement('div');
        btn.className = 'super-golden-button';
        btn.textContent = 'SUPER';

        const x = Math.random() * 80 + 10;
        const y = Math.random() * 80 + 10;
        btn.style.left = `${x}%`;
        btn.style.top = `${y}%`;

        // Click Handler
        btn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            if (btn.dataset.intervalId) clearInterval(btn.dataset.intervalId);

            // Super Reward (50x - 200x)
            const multiplier = Math.floor(Math.random() * 151) + 50;
            this.activateBuff(multiplier, 'super');
            this.spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, `SUPER RUSH x${multiplier}!`, true);

            this.goldStreak = 0; // Reset streak after super
            const streakDisplay = document.getElementById('streak-display');
            if (streakDisplay) {
                streakDisplay.textContent = `Streak: 0`;
                streakDisplay.style.display = 'none';
            }

            btn.remove();
        });

        document.querySelector('.app-container').appendChild(btn);

        // Move FASTER and more erratically
        const moveInterval = setInterval(() => {
            const newX = Math.random() * 90 + 5;
            const newY = Math.random() * 90 + 5;
            btn.style.left = `${newX}%`;
            btn.style.top = `${newY}%`;
        }, 400); // Faster updates

        btn.dataset.intervalId = moveInterval;

        // Despawn logic (Missed Super)
        setTimeout(() => {
            clearInterval(moveInterval);
            if (btn.parentNode) {
                this.goldStreak = 0;
                const streakDisplay = document.getElementById('streak-display');
                if (streakDisplay) {
                    streakDisplay.textContent = `Streak: 0`;
                    streakDisplay.style.display = 'none';
                }
                btn.remove();
            }
        }, 4000); // Faster despawn
    }

    spawnSilverButton() {
        // Only spawn if no other rush active (double check)
        if (this.globalMultiplier > 1) return;

        const btn = document.createElement('div');
        btn.className = 'silver-button';
        btn.textContent = 'SILVER';

        const x = Math.random() * 80 + 10;
        const y = Math.random() * 80 + 10;
        btn.style.left = `${x}%`;
        btn.style.top = `${y}%`;

        btn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.activateBuff(1.5, 'silver');
            this.spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, `SILVER RUSH x1.5!`, true); // Silver text style can be added later
            btn.remove();
        });

        document.querySelector('.app-container').appendChild(btn);

        // Silver doesn't move (or moves slowly? User said "random pos", didn't specify move. Let's make it static or slow. Let's do static for contrast to Gold)
        // User check: "数秒後に画面内のランダムな位置にシルバーボタンを出す". Implicitly might not move. Let's make it static for now to differ.

        // Despawn
        setTimeout(() => {
            if (btn.parentNode) btn.remove();
        }, 5000);
    }

    activateBuff(multiplier = 2, type = 'gold') {
        // Calculate center of main button for effect origin
        if (this.elBtn) {
            const rect = this.elBtn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            document.body.style.setProperty('--btn-x', `${centerX}px`);
            document.body.style.setProperty('--btn-y', `${centerY}px`);
        }

        this.globalMultiplier = multiplier;

        // Remove valid buff classes first
        document.body.classList.remove('buff-active', 'buff-active-silver', 'buff-active-super');

        let labelText = `GOLD RUSH! (x${multiplier})`;
        let duration = 30; // Default Gold
        let timerColor = 'white'; // Default

        if (type === 'silver') {
            document.body.classList.add('buff-active-silver');
            labelText = `SILVER RUSH! (x${multiplier})`;
            duration = 15;
            timerColor = '#c0c0c0'; // Silver color
        } else if (type === 'super') {
            document.body.classList.add('buff-active-super');
            labelText = `SUPER RUSH! (x${multiplier})`;
            duration = 15;
        } else {
            document.body.classList.add('buff-active'); // Standard Gold
        }

        this.elBuffIndicator.innerHTML = `${labelText} <span id="buff-timer" style="color: ${timerColor}">${duration.toFixed(1)}s</span>`;
        this.elBuffIndicator.style.display = 'block';

        const elTimer = document.getElementById('buff-timer');
        let timeLeft = duration;

        // Clear existing interval if overlapping (unlikely with current logic but good practice)
        if (this.buffInterval) clearInterval(this.buffInterval);

        // Use timeout ID for cleanup to avoid closure issues with rapid restarts (though with rush check this is safe)
        const currentTimeoutId = setTimeout(() => {
            this.globalMultiplier = 1;
            document.body.classList.remove('buff-active', 'buff-active-silver', 'buff-active-super');
            this.elBuffIndicator.style.display = 'none';
            if (this.buffInterval) clearInterval(this.buffInterval);
        }, duration * 1000);

        this.buffInterval = setInterval(() => {
            timeLeft -= 0.1;
            if (timeLeft <= 0) {
                timeLeft = 0;
            }
            if (elTimer) elTimer.textContent = timeLeft.toFixed(1) + 's';
        }, 100);
    }

    fireSatellites() {
        const lasers = document.querySelectorAll('.laser-beam');
        const beams = document.querySelectorAll('.station-beam');

        lasers.forEach(l => {
            l.classList.remove('fire-anim');
            void l.offsetWidth; // Trigger reflow
            l.classList.add('fire-anim');
        });

        beams.forEach(b => {
            b.classList.remove('station-fire-anim');
            void b.offsetWidth; // Trigger reflow
            b.classList.add('station-fire-anim');
        });
    }

    showSlotMachine() {
        // Create Overlay
        const overlay = document.createElement('div');
        overlay.className = 'slot-overlay';

        overlay.innerHTML = `
            <div class="slot-machine-container">
                <div class="slot-title">Neon Slots</div>
                <div class="slot-window">
                    <div class="slot-reel" id="reel-1"><div class="reel-content">7</div></div>
                    <div class="slot-reel" id="reel-2"><div class="reel-content">7</div></div>
                    <div class="slot-reel" id="reel-3"><div class="reel-content">7</div></div>
                </div>
                <div class="slot-status" id="slot-status">SPINNING...</div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Logic
        const reels = [
            document.querySelector('#reel-1 .reel-content'),
            document.querySelector('#reel-2 .reel-content'),
            document.querySelector('#reel-3 .reel-content')
        ];

        // Determine outcome
        const rand = Math.random();
        let multiplier = 5;
        let resultSymbols = [5, 5, 5]; // Default 5x

        if (rand > 0.95) { // 5% chance for 20x
            multiplier = 20;
            resultSymbols = ['7', '7', '7']; // Jackpot
        } else if (rand > 0.80) { // 15% chance for 10x
            multiplier = 10;
            resultSymbols = ['1', '1', '1'];
        } else {
            // 80% chance for 5x (Base)
            resultSymbols = ['5', '5', '5'];
        }

        // Animate
        reels.forEach((reel, index) => {
            // Populate reel with random numbers for spin effect
            let content = '';
            for (let i = 0; i < 20; i++) { // 20 frames of garbage
                content += `<div class="reel-item">${Math.floor(Math.random() * 10)}</div>`;
            }
            // Final Frame
            content += `<div class="reel-item">${resultSymbols[index]}</div>`;

            reel.innerHTML = content;

            // Start Spin
            setTimeout(() => {
                reel.parentElement.classList.add('reel-spinning');
                // Calculate height to slide: (20 items * 100px)
                const distance = 20 * 100;
                reel.style.transform = `translateY(-${distance}px)`;
                reel.style.transition = `transform ${1.5 + index * 0.5}s cubic-bezier(0.1, 0.1, 0.1, 1)`;
            }, 100);

            // End Spin
            setTimeout(() => {
                reel.parentElement.classList.remove('reel-spinning');
            }, 1500 + index * 500);
        });

        // Finish
        setTimeout(() => {
            document.getElementById('slot-status').textContent = `WINNER! x${multiplier}`;
            document.getElementById('slot-status').style.color = '#05f874';
            document.getElementById('slot-status').style.textShadow = '0 0 10px #05f874';

            // Highlight winning symbols
            reels.forEach(reel => {
                const winningItem = reel.lastElementChild; // The last item is the result
                if (winningItem) winningItem.classList.add('winner-symbol');
            });

            // Wait a bit then close and activate
            setTimeout(() => {
                overlay.remove();
                this.activateBuff(multiplier);
                this.spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, `GOLD RUSH x${multiplier}!`, true);
            }, 1500);

        }, 3000); // Max spin time (1.5 + 2*0.5 = 2.5s)
    }

    spawnFloatingText(x, y, text, isGold = false, isCrit = false) {
        const el = document.createElement('div');
        el.className = 'float-number' + (isGold ? ' float-gold' : '') + (isCrit ? ' float-crit' : '');
        el.textContent = text;

        // Add some randomness
        const randomX = (Math.random() - 0.5) * 40;

        el.style.left = `${x + randomX}px`;
        el.style.top = `${y - 20}px`;

        document.body.appendChild(el);

        // Cleanup
        setTimeout(() => {
            el.remove();
        }, 1000);
    }
}

// Start Game
window.addEventListener('DOMContentLoaded', () => {
    new ClickerGame();
});
