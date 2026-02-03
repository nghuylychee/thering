/**
 * Spine player integration for DiceRogue - renders player as Assassin Spine skeleton.
 * Depends: spine-player.min.js (SpinePlayer), game state (gameState, elements).
 */
(function () {
    'use strict';

    var spinePlayerInstance = null;
    var spineContainer = null;
    var currentAnimation = null;
    var combatPlayerInstance = null;
    var combatContainer = null;

    function getConfig() {
        return window.SPINE_CONFIG || {};
    }

    function isSpineEnabled() {
        var cfg = getConfig();
        return cfg.enabled && typeof spine !== 'undefined' && spine && spine.SpinePlayer;
    }

    /**
     * Create and load the Spine player in the given container element.
     * @param {HTMLElement} container - Element that will hold the player (sized/positioned like one grid cell).
     * @param {object} options - { jsonUrl, atlasUrl, scale, animation, showControls }
     */
    function initSpinePlayer(container, options) {
        if (!container || !isSpineEnabled()) return null;
        var cfg = getConfig();
        var skeleton = cfg.skeleton || {};
        var jsonUrl = options && options.jsonUrl || skeleton.jsonUrl || cfg.basePath + 'Assassin_Anim_01.json';
        var atlasUrl = options && options.atlasUrl || skeleton.atlasUrl || cfg.basePath + 'Assassin_Anim_01.atlas.txt';
        var scale = options && options.scale != null ? options.scale : (skeleton.scale != null ? skeleton.scale : 0.015);
        var animation = options && options.animation || cfg.defaultAnimation || cfg.animations.idle || 'Assassin_Idle_01';

        container.innerHTML = '';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';

        try {
            spinePlayerInstance = new spine.SpinePlayer(container, {
                jsonUrl: jsonUrl,
                atlasUrl: atlasUrl,
                scale: scale,
                animation: animation,
                defaultMix: 0,
                showControls: false,
                showLoading: true,
                alpha: true,
                backgroundColor: '00000000',
                premultipliedAlpha: skeleton.premultipliedAlpha !== false,
                preserveDrawingBuffer: false,
                success: function (player) {
                    currentAnimation = animation;
                    if (player.setAnimation) player.setAnimation(animation, true);
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
                error: function (player, msg) {
                    console.warn('[Spine] Load error:', msg);
                }
            });
            spineContainer = container;
            return spinePlayerInstance;
        } catch (e) {
            console.warn('[Spine] Init failed:', e);
            return null;
        }
    }

    /**
     * Play an animation by name.
     * @param {string} name - e.g. 'Assassin_Idle_01', 'Assassin_Walk_01', 'Assassin_Attack_01'
     * @param {boolean} loop
     */
    function playAnimation(name, loop) {
        if (loop === undefined) loop = (name && name.indexOf('Idle') >= 0) || (name && name.indexOf('Walk') >= 0);
        if (!spinePlayerInstance || !spinePlayerInstance.skeleton) return;
        try {
            if (typeof spinePlayerInstance.setAnimation === 'function') {
                spinePlayerInstance.setAnimation(name, loop);
                currentAnimation = name;
            }
        } catch (e) {
            console.warn('[Spine] setAnimation error:', e);
        }
    }

    function getAnimations() {
        var cfg = getConfig();
        return cfg.animations || { idle: 'Assassin_Idle_01', walk: 'Assassin_Walk_01', attack: 'Assassin_Attack_01' };
    }

    /**
     * Position the spine layer over the player cell: move layer inside the player cell so it always matches the grid.
     */
    function positionOverPlayerCell() {
        if (!spineContainer || !window.gameState || !window.gameState.player) return;
        var layer = document.getElementById('spine-player-layer');
        if (!layer) return;
        var gridEl = document.getElementById('gameGrid');
        var gridContainer = gridEl && gridEl.parentElement;
        if (!gridEl || !gridContainer) return;
        var player = gameState.player;
        var cell = gridEl.querySelector('[data-x="' + player.x + '"][data-y="' + player.y + '"]');
        if (!cell) {
            layer.style.display = 'none';
            if (layer.parentNode !== gridContainer) gridContainer.appendChild(layer);
            return;
        }
        if (layer.parentNode !== cell) cell.appendChild(layer);
        layer.style.display = 'block';
        layer.style.position = 'absolute';
        layer.style.left = '0';
        layer.style.top = '0';
        layer.style.width = '100%';
        layer.style.height = '100%';
        layer.style.pointerEvents = 'none';
        layer.style.background = 'transparent';
    }

    /**
     * Show or hide the spine layer (e.g. hide when not in game screen).
     */
    function setSpineLayerVisible(visible) {
        var layer = document.getElementById('spine-player-layer');
        if (layer) layer.style.display = visible ? 'block' : 'none';
    }

    /**
     * Init Spine player for combat screen (separate instance from grid).
     * Uses same Assassin skeleton; idle = AssassinPyramid_Idle_01, attack = AssassinPyramid_Attack_01.
     */
    function initCombatPlayer(container) {
        if (!container || !isSpineEnabled()) return null;
        var cfg = getConfig();
        var skeleton = cfg.skeleton || {};
        var jsonUrl = skeleton.jsonUrl || cfg.basePath + 'Assassin_Anim_01.json';
        var atlasUrl = skeleton.atlasUrl || cfg.basePath + 'Assassin_Anim_01.atlas.txt';
        var scale = skeleton.scale != null ? skeleton.scale : 0.015;
        var idleAnim = cfg.combatPlayerIdle || 'AssassinPyramid_Idle_01';

        container.innerHTML = '';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.background = 'transparent';
        container.className = (container.className || '') + ' combat-player-spine-container';

        try {
            combatPlayerInstance = new spine.SpinePlayer(container, {
                jsonUrl: jsonUrl,
                atlasUrl: atlasUrl,
                scale: scale,
                animation: idleAnim,
                defaultMix: 0,
                showControls: false,
                showLoading: false,
                alpha: true,
                backgroundColor: '00000000',
                premultipliedAlpha: skeleton.premultipliedAlpha !== false,
                preserveDrawingBuffer: false,
                success: function (player) {
                    if (player.setAnimation) player.setAnimation(idleAnim, true);
                    var root = container.querySelector('.spine-player');
                    if (root) { root.style.backgroundColor = 'transparent'; root.style.background = 'transparent'; }
                    var canvas = container.querySelector('canvas');
                    if (canvas) { canvas.style.backgroundColor = 'transparent'; canvas.style.background = 'transparent'; }
                },
                error: function (player, msg) { console.warn('[Spine Combat] Load error:', msg); }
            });
            combatContainer = container;
            return combatPlayerInstance;
        } catch (e) {
            console.warn('[Spine Combat] Init failed:', e);
            return null;
        }
    }

    /**
     * Play animation on combat player (e.g. AssassinPyramid_Attack_01 when attacking).
     * @param {string} name - e.g. 'AssassinPyramid_Attack_01'
     * @param {boolean} loop
     */
    function playCombatPlayerAnimation(name, loop) {
        if (loop === undefined) loop = false;
        if (!combatPlayerInstance || !combatPlayerInstance.skeleton) return;
        try {
            if (typeof combatPlayerInstance.setAnimation === 'function') {
                combatPlayerInstance.setAnimation(name, loop);
            }
        } catch (e) { console.warn('[Spine Combat] setAnimation error:', e); }
    }

    /**
     * After attack animation, switch combat player back to idle.
     */
    function combatPlayerBackToIdle() {
        var cfg = getConfig();
        var idleAnim = cfg.combatPlayerIdle || 'AssassinPyramid_Idle_01';
        playCombatPlayerAnimation(idleAnim, true);
    }

    function dispose() {
        if (spinePlayerInstance && typeof spinePlayerInstance.dispose === 'function') {
            try { spinePlayerInstance.dispose(); } catch (e) {}
            spinePlayerInstance = null;
        }
        spineContainer = null;
        if (combatPlayerInstance && typeof combatPlayerInstance.dispose === 'function') {
            try { combatPlayerInstance.dispose(); } catch (e) {}
            combatPlayerInstance = null;
        }
        combatContainer = null;
    }

    window.SpinePlayerIntegration = {
        isEnabled: isSpineEnabled,
        init: initSpinePlayer,
        play: playAnimation,
        getAnimations: getAnimations,
        positionOverPlayerCell: positionOverPlayerCell,
        setVisible: setSpineLayerVisible,
        dispose: dispose,
        getInstance: function () { return spinePlayerInstance; },
        initCombatPlayer: initCombatPlayer,
        playCombatPlayerAnimation: playCombatPlayerAnimation,
        combatPlayerBackToIdle: combatPlayerBackToIdle
    };
})();
