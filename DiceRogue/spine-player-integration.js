/**
 * Spine player integration: one Spine instance for map player (Fighter from SPINE_CONFIG).
 * Positions overlay over the player grid cell; supports combat screen instance.
 */
(function () {
    'use strict';

    function getConfig() {
        return window.SPINE_CONFIG || {};
    }

    function isEnabled() {
        var cfg = getConfig();
        return cfg.enabled && cfg.skeleton && typeof spine !== 'undefined' && spine && spine.SpinePlayer;
    }

    var _instance = null;
    var _combatInstance = null;
    var _container = null;
    var _combatWrap = null;

    function init(container) {
        if (!container || !isEnabled()) return null;
        _container = container;
        var cfg = getConfig().skeleton;
        if (!cfg || !cfg.jsonUrl) return null;
        container.innerHTML = '';
        container.style.background = 'transparent';
        try {
            var player = new spine.SpinePlayer(container, {
                jsonUrl: cfg.jsonUrl,
                atlasUrl: cfg.atlasUrl,
                scale: cfg.scale != null ? cfg.scale : 0.015,
                skin: cfg.skin || 'default',
                animation: cfg.defaultAnimation || 'Fighter_Idle_01',
                defaultMix: 0,
                showControls: false,
                showLoading: false,
                alpha: true,
                backgroundColor: '00000000',
                premultipliedAlpha: true,
                preserveDrawingBuffer: false,
                success: function (p) {
                    _instance = p;
                    if (p.setSkin) p.setSkin(cfg.skin || 'default');
                    if (p.setAnimation) p.setAnimation(cfg.defaultAnimation || 'Fighter_Idle_01', true);
                    if (p.play) p.play();
                    if (p.startRendering) p.startRendering();
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
                    console.warn('[Spine Player] Load error:', msg);
                    _instance = null;
                }
            });
            return player;
        } catch (e) {
            console.warn('[Spine Player] Init failed:', e);
            return null;
        }
    }

    function getInstance() {
        return _instance;
    }

    function positionOverPlayerCell(cellEl) {
        var layer = document.getElementById('spine-player-layer');
        if (!layer) return;
        if (!cellEl || !cellEl.isConnected) {
            layer.style.display = 'none';
            return;
        }
        var parent = layer.parentElement;
        if (!parent) return;
        var cellRect = cellEl.getBoundingClientRect();
        var parentRect = parent.getBoundingClientRect();
        if (cellRect.width <= 0 || cellRect.height <= 0) return;
        layer.style.left = (cellRect.left - parentRect.left) + 'px';
        layer.style.top = (cellRect.top - parentRect.top) + 'px';
        layer.style.width = cellRect.width + 'px';
        layer.style.height = cellRect.height + 'px';
        layer.style.display = 'block';
    }

    function setVisible(visible) {
        var layer = document.getElementById('spine-player-layer');
        if (layer) layer.style.display = visible ? 'block' : 'none';
    }

    function play(animName, loop) {
        if (!_instance || typeof _instance.setAnimation !== 'function') return;
        try {
            _instance.setAnimation(animName, loop !== false);
        } catch (e) { console.warn('[Spine Player] play:', e); }
    }

    function initCombatPlayer(wrapEl) {
        if (!wrapEl || !isEnabled()) return null;
        _combatWrap = wrapEl;
        wrapEl.innerHTML = '';
        wrapEl.style.background = 'transparent';
        var cfg = getConfig().skeleton;
        if (!cfg || !cfg.jsonUrl) return null;
        try {
            var player = new spine.SpinePlayer(wrapEl, {
                jsonUrl: cfg.jsonUrl,
                atlasUrl: cfg.atlasUrl,
                scale: cfg.scale != null ? cfg.scale : 0.015,
                skin: cfg.skin || 'default',
                animation: (getConfig().combatPlayerIdle) || 'Fighter_Idle_01',
                defaultMix: 0,
                showControls: false,
                showLoading: false,
                alpha: true,
                backgroundColor: '00000000',
                premultipliedAlpha: true,
                preserveDrawingBuffer: false,
                success: function (p) {
                    _combatInstance = p;
                    if (p.setSkin) p.setSkin(cfg.skin || 'default');
                    if (p.setAnimation) p.setAnimation((getConfig().combatPlayerIdle) || 'Fighter_Idle_01', true);
                    if (p.play) p.play();
                    if (p.startRendering) p.startRendering();
                    var root = wrapEl.querySelector('.spine-player');
                    if (root) {
                        root.style.backgroundColor = 'transparent';
                        root.style.background = 'transparent';
                    }
                },
                error: function (p, msg) {
                    console.warn('[Spine Player Combat] Load error:', msg);
                    _combatInstance = null;
                }
            });
            return player;
        } catch (e) {
            console.warn('[Spine Player Combat] Init failed:', e);
            return null;
        }
    }

    function playCombatPlayerAnimation(animName, loop) {
        if (!_combatInstance || typeof _combatInstance.setAnimation !== 'function') return;
        try {
            _combatInstance.setAnimation(animName, loop !== false);
        } catch (e) { console.warn('[Spine Player Combat] play:', e); }
    }

    function combatPlayerBackToIdle() {
        var anim = (getConfig().combatPlayerIdle) || 'Fighter_Idle_01';
        playCombatPlayerAnimation(anim, true);
    }

    window.SpinePlayerIntegration = {
        isEnabled: isEnabled,
        init: init,
        getInstance: getInstance,
        positionOverPlayerCell: positionOverPlayerCell,
        setVisible: setVisible,
        play: play,
        initCombatPlayer: initCombatPlayer,
        playCombatPlayerAnimation: playCombatPlayerAnimation,
        combatPlayerBackToIdle: combatPlayerBackToIdle
    };
})();
