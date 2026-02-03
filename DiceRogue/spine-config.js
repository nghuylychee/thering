// Spine animation config for DiceRogue (Player: Assassin; Enemies: Monster_Lv1-5)
window.SPINE_CONFIG = {
    enabled: true,
    basePath: 'assets/Assassin/',
    skeleton: {
        jsonUrl: 'assets/Assassin/Assassin_Anim_01.json',
        atlasUrl: 'assets/Assassin/Assassin_Anim_01.atlas.txt',
        scale: 0.015,
        premultipliedAlpha: true
    },
    animations: {
        idle: 'Assassin_Idle_01',
        walk: 'Assassin_Walk_01',
        attack: 'Assassin_Attack_01',
        attack2: 'Assassin_Attack_02',
        behit: 'Assassin_Behit_01',
        dead: 'Assassin_Dead_01'
    },
    defaultAnimation: 'Assassin_Idle_01',
    // Combat screen: player uses Pyramid variant for attack
    combatPlayerIdle: 'AssassinPyramid_Idle_01',
    combatPlayerAttack: 'AssassinPyramid_Attack_01',

    // Enemies: 5 types -> Monster_Lv1 .. Monster_Lv5 (same size/transparent as player)
    enemiesEnabled: true,
    enemiesBasePath: 'assets/Monsters/',
    enemies: {
        'Giant Rat': { folder: 'Monster_Lv1', json: 'Monster_Lv1.json', atlas: 'Monster_Lv1.atlas.txt', scale: 0.015, defaultAnimation: 'Monster1_Fly_01', jumpAnimation: 'Monster1_Fly_01' },
        'Goblin':     { folder: 'Monster_Lv2', json: 'Monster_Lv2.json', atlas: 'Monster_Lv2.atlas.txt', scale: 0.015, defaultAnimation: 'Monster2_Fly_01', jumpAnimation: 'Monster2_Fly_01' },
        'Orc':        { folder: 'Monster_Lv3', json: 'Monster_Lv3.json', atlas: 'Monster_Lv3.atlas.txt', scale: 0.015, defaultAnimation: 'Monster3_Down_01', jumpAnimation: 'Monster3_Walk_01' },
        'Troll':      { folder: 'Monster_Lv4', json: 'Monster_Lv4.json', atlas: 'Monster_Lv4.atlas.txt', scale: 0.015, defaultAnimation: 'Monster4_Down_01', jumpAnimation: 'Monster4_Walk_01' },
        'Dragon':     { folder: 'Monster_Lv5', json: 'Monster_Lv5.json', atlas: 'Monster_Lv5.atlas.txt', scale: 0.015, defaultAnimation: 'Monster5_Fly_01', jumpAnimation: 'Monster5_Fly_01' }
    }
};
