/**
 * Spine enemy integration - one Spine player per enemy cell (same size/position/transparent as player).
 */
(function () {
    'use strict';

    function getConfig() {
        return window.SPINE_CONFIG || {};
    }

    function isEnemySpineEnabled() {
        var cfg = getConfig();
        return cfg.enemiesEnabled && cfg.enemies && typeof spine !== 'undefined' && spine && spine.SpinePlayer;
    }

    function getEnemySpineConfig(enemyTypeName) {
        var cfg = getConfig();
        if (!cfg.enemies) return null;
        var base = cfg.enemiesBasePath || 'assets/Monsters/';
        var entry = cfg.enemies[enemyTypeName];
        if (!entry) return null;
        var folder = entry.folder || ('Monster_Lv' + 1);
        return {
            jsonUrl: base + folder + '/' + (entry.json || folder + '.json'),
            atlasUrl: base + folder + '/' + (entry.atlas || folder + '.atlas.txt'),
            scale: entry.scale != null ? entry.scale : 0.015,
            defaultAnimation: entry.defaultAnimation || 'Monster1_Down_01',
            jumpAnimation: entry.jumpAnimation || 'Monster1_Jump_01'
        };
    }

    function showEmojiFallback(container) {
        if (!container) return;
        var emoji = container.getAttribute('data-emoji') || '👹';
        container.innerHTML = '';
        container.className = 'enemy-spine-container enemy-spine-fallback';
        var span = document.createElement('span');
        span.style.cssText = 'font-size: 28px; line-height: 1; pointer-events: none;';
        span.textContent = emoji;
        container.appendChild(span);
    }

    /**
     * Init Spine in a container for the given enemy type (same options as player: transparent, size).
     */
    function initEnemySpine(container, enemyTypeName) {
        if (!container || !isEnemySpineEnabled()) {
            if (container) showEmojiFallback(container);
            return null;
        }
        var ec = getEnemySpineConfig(enemyTypeName);
        if (!ec) {
            showEmojiFallback(container);
            return null;
        }
        container.innerHTML = '';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'absolute';
        container.style.left = '0';
        container.style.top = '0';
        container.style.overflow = 'hidden';
        container.style.pointerEvents = 'none';
        container.style.background = 'transparent';
        container.className = 'enemy-spine-container';
        var emojiFallback = container.getAttribute('data-emoji') || '👹';

        try {
            var player = new spine.SpinePlayer(container, {
                jsonUrl: ec.jsonUrl,
                atlasUrl: ec.atlasUrl,
                scale: ec.scale,
                animation: ec.defaultAnimation,
                defaultMix: 0,
                showControls: false,
                showLoading: false,
                alpha: true,
                backgroundColor: '00000000',
                premultipliedAlpha: true,
                preserveDrawingBuffer: false,
                success: function (p) {
                    if (p.setAnimation) p.setAnimation(ec.defaultAnimation, true);
                    container._spineEnemyPlayer = p;
                    container.classList.add('spine-inited');
                    var root = container.querySelector('.spine-player');
                    if (root) {
                        root.style.backgroundColor = 'transparent';
                        root.style.background = 'transparent';
                    }
                    var canvas = container.querySelector('canvas');
                    if (canvas) {
                        canvas.style.backgroundColor = 'transparent';
                        canvas.style.background = 'transparent';
                    }
                },
                error: function (p, msg) {
                    console.warn('[Spine Enemy] Load error:', enemyTypeName, msg);
                    showEmojiFallback(container);
                }
            });
            return player;
        } catch (e) {
            console.warn('[Spine Enemy] Init failed:', enemyTypeName, e);
            showEmojiFallback(container);
            return null;
        }
    }

    /**
     * After grid is rendered, init Spine in all .enemy-spine-container that have data-enemy-type.
     */
    function initEnemiesInGrid() {
        if (!isEnemySpineEnabled()) return;
        var containers = document.querySelectorAll('.enemy-spine-container[data-enemy-type]');
        for (var i = 0; i < containers.length; i++) {
            var el = containers[i];
            var typeName = el.getAttribute('data-enemy-type');
            if (typeName && !el.querySelector('.spine-player')) {
                initEnemySpine(el, typeName);
            }
        }
    }

    /** Pool: reuse Spine containers so we don't re-create/reload on every renderGrid (avoids flicker). */
    var pool = {};

    /**
     * Call before clearing the grid (before gameGrid.innerHTML = '').
     * Removes all inited enemy Spine containers from DOM and stores them in pool by enemy type.
     */
    function beforeGridClear(gameGridElement) {
        if (!gameGridElement) return;
        var cells = gameGridElement.querySelectorAll('.grid-cell');
        for (var i = 0; i < cells.length; i++) {
            var container = cells[i].querySelector('.enemy-spine-container.spine-inited');
            if (!container) {
                var all = cells[i].querySelectorAll('.enemy-spine-container');
                for (var j = 0; j < all.length; j++) {
                    if (all[j].querySelector('.spine-player')) { container = all[j]; break; }
                }
            }
            if (container && container.querySelector('.spine-player')) {
                var typeName = container.getAttribute('data-enemy-type');
                if (typeName) {
                    container.remove();
                    if (!pool[typeName]) pool[typeName] = [];
                    pool[typeName].push(container);
                }
            }
        }
    }

    /**
     * Get a reused container for this enemy type if available (already has Spine inited).
     * Returns null if pool is empty for this type.
     */
    function getPooledContainer(enemyType) {
        if (!enemyType || !pool[enemyType] || pool[enemyType].length === 0) return null;
        return pool[enemyType].pop();
    }

    /**
     * Play animation on the Spine in the given grid cell (if it has an enemy Spine container).
     * @param {HTMLElement} cellElement - grid cell DOM element
     * @param {string} animName - e.g. 'Monster1_Jump_01'
     * @param {boolean} loop
     */
    function playAnimationInCell(cellElement, animName, loop) {
        if (!cellElement || !animName) return;
        var container = cellElement.querySelector('.enemy-spine-container');
        if (!container || !container._spineEnemyPlayer) return;
        try {
            if (typeof container._spineEnemyPlayer.setAnimation === 'function') {
                container._spineEnemyPlayer.setAnimation(animName, loop !== false);
            }
        } catch (e) { console.warn('[Spine Enemy] playAnimationInCell:', e); }
    }

    /**
     * Play default (idle) animation for the enemy Spine in the given cell.
     */
    function playDefaultInCell(cellElement) {
        if (!cellElement) return;
        var container = cellElement.querySelector('.enemy-spine-container');
        if (!container) return;
        var typeName = container.getAttribute('data-enemy-type');
        var ec = typeName ? getEnemySpineConfig(typeName) : null;
        var defaultAnim = ec ? ec.defaultAnimation : 'Monster1_Fly_01';
        playAnimationInCell(cellElement, defaultAnim, true);
    }

    /**
     * Get jump animation name for enemy type (for movement).
     */
    function getJumpAnimation(enemyTypeName) {
        var ec = getEnemySpineConfig(enemyTypeName);
        return ec ? ec.jumpAnimation : 'Monster1_Jump_01';
    }

    window.SpineEnemyIntegration = {
        isEnabled: isEnemySpineEnabled,
        getConfig: getEnemySpineConfig,
        initEnemy: initEnemySpine,
        initAllInGrid: initEnemiesInGrid,
        beforeGridClear: beforeGridClear,
        getPooledContainer: getPooledContainer,
        playAnimationInCell: playAnimationInCell,
        playDefaultInCell: playDefaultInCell,
        getJumpAnimation: getJumpAnimation
    };
})();
