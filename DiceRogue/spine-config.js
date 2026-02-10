/**
 * Spine player config: Fighter skeleton with max skin (Fighter_Helmet4).
 * Used by spine-player-integration.js and game.js for animation names.
 */
(function () {
    'use strict';
    var basePath = 'assets/Fighter/';
    window.SPINE_CONFIG = {
        enabled: true,
        basePath: basePath,
        skeleton: {
            jsonUrl: basePath + 'Fighter_Anim_01.json',
            atlasUrl: basePath + 'Fighter_Anim_01.atlas.txt',
            scale: 1,
            skin: 'Fighter_Helmet4',
            defaultAnimation: 'Fighter_Idle_01'
        },
        animations: {
            idle: 'Fighter_Idle_01',
            walk: 'Fighter_Walk_01',
            attack: 'Fighter_Attack_01'
        },
        combatPlayerIdle: 'Fighter_Idle_01',
        combatPlayerAttack: 'Fighter_Attack_01',
        combatPlayerWalk: 'Fighter_Walk_01',
        enemiesEnabled: true,
        enemiesBasePath: 'assets/Monsters/',
        enemies: {
            'Giant Rat': { folder: 'Monster_Lv1', scale: 0.015, defaultAnimation: 'Monster1_Fly_01', jumpAnimation: 'Monster1_Jump_01' },
            'Goblin': { folder: 'Monster_Lv2', scale: 0.015, defaultAnimation: 'Monster2_Fly_01', jumpAnimation: 'Monster2_Jump_01' },
            'Orc': { folder: 'Monster_Lv3', scale: 0.015, defaultAnimation: 'Monster3_Down_01', jumpAnimation: 'Monster3_Jump_01' },
            'Troll': { folder: 'Monster_Lv4', scale: 0.015, defaultAnimation: 'Monster4_Down_01', jumpAnimation: 'Monster4_Jump_01' },
            'Dragon': { folder: 'Monster_Lv5', scale: 0.015, defaultAnimation: 'Monster5_Fly_01', jumpAnimation: 'Monster5_Jump_01' }
        }
    };
})();
