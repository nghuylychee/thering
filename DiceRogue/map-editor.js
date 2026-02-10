/**
 * DiceRogue Map Editor – tilemap editor, output dicerogue-map.json
 * Brush terrain (floor/empty by theme) and layout (P, enemies, items, specials). Renders sprites from assets.
 */
(function () {
    'use strict';

    const THEMES = (typeof ASSETS_CONFIG !== 'undefined' && ASSETS_CONFIG.themes)
        ? Object.entries(ASSETS_CONFIG.themes).map(([id, t]) => ({ id, name: (ASSETS_CONFIG.areaThemes || []).find(a => a.id === id)?.name || id }))
        : [
            { id: 'greenland', name: 'Greenland' },
            { id: 'freljord', name: 'Freljord' },
            { id: 'hot_sand', name: 'Hot sand' },
            { id: 'sakura', name: 'Sakura' },
            { id: 'island', name: 'Island' }
        ];

    const ENEMY_TYPES = (typeof CONFIG !== 'undefined' && CONFIG.ENEMY_TYPES) ? CONFIG.ENEMY_TYPES : [
        { name: 'Giant Rat', value: 1 }, { name: 'Goblin', value: 3 }, { name: 'Orc', value: 5 }, { name: 'Troll', value: 6 }, { name: 'Dragon', value: 8 }
    ];
    const ITEM_TYPES = (typeof CONFIG !== 'undefined' && CONFIG.ITEM_TYPES) ? CONFIG.ITEM_TYPES : [
        { name: 'Small Gem', value: 1 }, { name: 'Treasure Ring', value: 2 }, { name: 'Enchanted Blade', value: 3 }, { name: 'Royal Crown', value: 5 }
    ];

    const mapBasePath = (typeof ASSETS_CONFIG !== 'undefined' && ASSETS_CONFIG.mapBasePath) ? ASSETS_CONFIG.mapBasePath : 'assets/map/';
    const basePath = (typeof ASSETS_CONFIG !== 'undefined' && ASSETS_CONFIG.basePath) ? ASSETS_CONFIG.basePath : 'assets/images/';

    let state = {
        width: 12,
        height: 12,
        themeId: 'greenland',
        terrain: [],   // [y][x] = { themeId, type: 'floor'|'empty' }
        layout: [],    // [y][x] = 0 | 'P' | 'B' | ...
        multiCellDecors: [], // [ { x, y, themeId, assetId, w, h } ]
        imageCache: {},
        terrainBrush: { themeId: 'greenland', type: 'floor' },
        decorBrush: null,   // null | { themeId, type: 'none'|assetId }
        layoutBrush: null,
        painting: false,
        zoom: 1
    };

    function getAssetPath(relativePath, useMapBase) {
        const prefix = /^(greenland|freljord|hotsand|sakura|island)\//;
        if (useMapBase !== false && prefix.test(relativePath)) return mapBasePath + relativePath;
        return basePath + relativePath;
    }

    function loadImage(path) {
        const full = getAssetPath(path);
        if (state.imageCache[full]) return Promise.resolve(state.imageCache[full]);
        return new Promise(function (resolve) {
            const img = new Image();
            img.onload = function () { state.imageCache[full] = img; resolve(img); };
            img.onerror = function () { resolve(null); };
            img.src = full;
        });
    }

    function preloadEditorImages() {
        const promises = [];
        THEMES.forEach(function (t) {
            const theme = (ASSETS_CONFIG.themes && ASSETS_CONFIG.themes[t.id]) || {};
            if (theme.gridCells && theme.gridCells.default) promises.push(loadImage(theme.gridCells.default));
            if (theme.multiCellDecorAssets) {
                Object.values(theme.multiCellDecorAssets).forEach(function (a) { if (a && a.image) promises.push(loadImage(a.image)); });
            }
        });
        if (ASSETS_CONFIG.player && ASSETS_CONFIG.player.image) promises.push(loadImage(ASSETS_CONFIG.player.image));
        if (ASSETS_CONFIG.enemies) Object.values(ASSETS_CONFIG.enemies).forEach(function (e) { if (e.image) promises.push(loadImage(e.image)); });
        if (ASSETS_CONFIG.items) Object.values(ASSETS_CONFIG.items).forEach(function (i) { if (i.image) promises.push(loadImage(i.image)); });
        if (ASSETS_CONFIG.specialGrids) Object.values(ASSETS_CONFIG.specialGrids).forEach(function (s) { if (s.image) promises.push(loadImage(s.image)); });
        return Promise.all(promises);
    }

    function getDecorImage(themeId, assetId) {
        const theme = (ASSETS_CONFIG.themes && ASSETS_CONFIG.themes[themeId]) || {};
        const assets = theme.multiCellDecorAssets || (ASSETS_CONFIG.multiCellDecorAssets || {});
        const cfg = assets[assetId];
        if (!cfg || !cfg.image) return null;
        return state.imageCache[getAssetPath(cfg.image)] || null;
    }

    function getTerrainImage(themeId, type) {
        if (type === 'empty') return null;
        const theme = (ASSETS_CONFIG.themes && ASSETS_CONFIG.themes[themeId]) || {};
        const path = (theme.gridCells && theme.gridCells.default) ? theme.gridCells.default : 'grid/grid.png';
        return state.imageCache[getAssetPath(path)] || null;
    }

    function getLayoutImage(layoutValue) {
        if (layoutValue === 'P' && ASSETS_CONFIG.player && ASSETS_CONFIG.player.image)
            return state.imageCache[getAssetPath(ASSETS_CONFIG.player.image, false)] || null;
        if (typeof layoutValue === 'number') {
            if (layoutValue < 0) {
                const et = ENEMY_TYPES.find(function (e) { return e.value === Math.abs(layoutValue); });
                const name = et && et.name ? et.name : 'Giant Rat';
                const en = ASSETS_CONFIG.enemies && ASSETS_CONFIG.enemies[name];
                if (en && en.image) return state.imageCache[getAssetPath(en.image, false)] || null;
            } else {
                const it = ITEM_TYPES.find(function (i) { return i.value === layoutValue; });
                const name = it && it.name ? it.name : 'Small Gem';
                const item = ASSETS_CONFIG.items && ASSETS_CONFIG.items[name];
                if (item && item.image) return state.imageCache[getAssetPath(item.image, false)] || null;
            }
        }
        const special = ASSETS_CONFIG.specialGrids && ASSETS_CONFIG.specialGrids[layoutValue];
        if (special && special.image) return state.imageCache[getAssetPath(special.image, false)] || null;
        return null;
    }

    function getLayoutEmoji(layoutValue) {
        if (layoutValue === 'P') return (ASSETS_CONFIG.player && ASSETS_CONFIG.player.emoji) || '🧙';
        if (typeof layoutValue === 'number') {
            if (layoutValue < 0) {
                const et = ENEMY_TYPES.find(function (e) { return e.value === Math.abs(layoutValue); });
                return (et && ASSETS_CONFIG.enemies && ASSETS_CONFIG.enemies[et.name] && ASSETS_CONFIG.enemies[et.name].emoji) || '👹';
            }
            const it = ITEM_TYPES.find(function (i) { return i.value === layoutValue; });
            return (it && ASSETS_CONFIG.items && ASSETS_CONFIG.items[it.name] && ASSETS_CONFIG.items[it.name].emoji) || '⭐';
        }
        const special = ASSETS_CONFIG.specialGrids && ASSETS_CONFIG.specialGrids[layoutValue];
        return (special && special.emoji) || '?';
    }

    function initBlankTerrainAndLayout() {
        const t = [];
        const l = [];
        for (let y = 0; y < state.height; y++) {
            t[y] = [];
            l[y] = [];
            for (let x = 0; x < state.width; x++) {
                t[y][x] = { type: 'empty' };
                l[y][x] = 0;
            }
        }
        state.terrain = t;
        state.layout = l;
    }

    function ensureTerrainLayoutSize() {
        for (let y = 0; y < state.height; y++) {
            if (!state.terrain[y]) state.terrain[y] = [];
            if (!state.layout[y]) state.layout[y] = [];
            for (let x = 0; x < state.width; x++) {
                if (!state.terrain[y][x]) state.terrain[y][x] = { type: 'empty' };
                if (state.layout[y][x] === undefined) state.layout[y][x] = 0;
            }
        }
    }

    function renderMapGrid() {
        const grid = document.getElementById('mapGrid');
        if (!grid) return;
        const cellSize = 48 * (state.zoom || 1);
        grid.style.setProperty('--cell-size', cellSize + 'px');
        grid.style.gridTemplateColumns = 'repeat(' + state.width + ', ' + cellSize + 'px)';
        grid.style.gridTemplateRows = 'repeat(' + state.height + ', ' + cellSize + 'px)';
        grid.innerHTML = '';
        ensureTerrainLayoutSize();
        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'map-cell';
                cell.setAttribute('data-x', x);
                cell.setAttribute('data-y', y);
                const terrain = state.terrain[y][x] || { type: 'empty' };
                const layoutVal = state.layout[y][x];
                const bg = document.createElement('div');
                bg.className = 'terrain-bg';
                const img = terrain.type === 'empty' ? null : getTerrainImage(terrain.themeId, terrain.type);
                if (img) bg.style.backgroundImage = 'url(' + img.src + ')';
                else bg.style.backgroundImage = 'none';
                if (terrain.type === 'empty') bg.style.backgroundColor = '#16161e';
                else bg.style.backgroundColor = '#1e2e2e';
                cell.appendChild(bg);
                const overlay = document.createElement('div');
                overlay.className = 'overlay';
                const layoutImg = layoutVal && layoutVal !== 0 ? getLayoutImage(layoutVal) : null;
                if (layoutImg) {
                    const oImg = document.createElement('img');
                    oImg.src = layoutImg.src;
                    oImg.alt = String(layoutVal);
                    overlay.appendChild(oImg);
                } else if (layoutVal != null && layoutVal !== 0) {
                    const span = document.createElement('span');
                    span.className = 'emoji';
                    span.textContent = getLayoutEmoji(layoutVal);
                    overlay.appendChild(span);
                }
                cell.appendChild(overlay);
                grid.appendChild(cell);
            }
        }
        state.multiCellDecors.forEach(function (d) {
            const cell = grid.querySelector('.map-cell[data-x="' + d.x + '"][data-y="' + d.y + '"]');
            if (!cell) return;
            const img = getDecorImage(d.themeId, d.assetId);
            if (!img) return;
            const cellSize = 48 * (state.zoom || 1);
            const dec = document.createElement('div');
            dec.className = 'decor-overlay';
            dec.style.backgroundImage = 'url(' + img.src + ')';
            dec.style.width = (d.w * cellSize) + 'px';
            dec.style.height = (d.h * cellSize) + 'px';
            cell.appendChild(dec);
        });
        attachPaintListeners(grid);
    }

    function multiCellDecorContains(d, cx, cy) {
        return cx >= d.x && cx < d.x + d.w && cy >= d.y && cy < d.y + d.h;
    }

    var pendingDecorRender = false;
    function scheduleDecorRender() {
        if (pendingDecorRender) return;
        pendingDecorRender = true;
        requestAnimationFrame(function () {
            pendingDecorRender = false;
            renderMapGrid();
        });
    }

    function paintCell(x, y) {
        if (x < 0 || x >= state.width || y < 0 || y >= state.height) return;
        if (state.terrainBrush) {
            state.terrain[y][x] = { themeId: state.terrainBrush.themeId, type: state.terrainBrush.type };
        }
        if (state.decorBrush) {
            if (state.decorBrush.type === 'none') {
                state.multiCellDecors = state.multiCellDecors.filter(function (d) { return !multiCellDecorContains(d, x, y); });
            } else {
                const theme = (ASSETS_CONFIG.themes && ASSETS_CONFIG.themes[state.decorBrush.themeId]) || {};
                const assets = theme.multiCellDecorAssets || {};
                const cfg = assets[state.decorBrush.type];
                if (cfg && cfg.w && cfg.h) {
                    state.multiCellDecors = state.multiCellDecors.filter(function (d) {
                        return !(d.x < x + cfg.w && d.x + d.w > x && d.y < y + cfg.h && d.y + d.h > y);
                    });
                    state.multiCellDecors.push({
                        x: x, y: y, themeId: state.decorBrush.themeId,
                        assetId: state.decorBrush.type, w: cfg.w, h: cfg.h
                    });
                }
            }
        }
        if (state.layoutBrush !== undefined) {
            state.layout[y][x] = state.layoutBrush === null ? 0 : state.layoutBrush;
        }
        if (state.decorBrush) {
            scheduleDecorRender();
        } else {
            const cell = document.querySelector('.map-cell[data-x="' + x + '"][data-y="' + y + '"]');
            if (cell) updateCellContent(cell, x, y);
        }
    }

    function updateCellContent(cell, x, y) {
        const bg = cell.querySelector('.terrain-bg');
        const overlay = cell.querySelector('.overlay');
        if (!bg || !overlay) return;
        const terrain = state.terrain[y][x] || { type: 'empty' };
        const layoutVal = state.layout[y][x];
        const img = terrain.type === 'empty' ? null : getTerrainImage(terrain.themeId, terrain.type);
        if (img) bg.style.backgroundImage = 'url(' + img.src + ')';
        else bg.style.backgroundImage = 'none';
        if (terrain.type === 'empty') bg.style.backgroundColor = '#16161e';
        else bg.style.backgroundColor = '#1e2e2e';
        overlay.innerHTML = '';
        if (layoutVal != null && layoutVal !== 0) {
            const layoutImg = getLayoutImage(layoutVal);
            if (layoutImg) {
                const oImg = document.createElement('img');
                oImg.src = layoutImg.src;
                overlay.appendChild(oImg);
            } else {
                const span = document.createElement('span');
                span.className = 'emoji';
                span.textContent = getLayoutEmoji(layoutVal);
                overlay.appendChild(span);
            }
        }
    }

    function attachPaintListeners(grid) {
        if (!grid) return;
        grid.querySelectorAll('.map-cell').forEach(function (cell) {
            const x = parseInt(cell.getAttribute('data-x'), 10);
            const y = parseInt(cell.getAttribute('data-y'), 10);
            cell.addEventListener('mousedown', function (e) {
                e.preventDefault();
                state.painting = true;
                paintCell(x, y);
            });
        });
        grid.addEventListener('mouseleave', function () {
            if (state.painting && state.decorBrush) scheduleDecorRender();
            state.painting = false;
        });
        grid.addEventListener('mouseup', function () {
            if (state.painting && state.decorBrush) renderMapGrid();
            state.painting = false;
        });
        grid.addEventListener('mousemove', function (e) {
            if (!state.painting) return;
            const cell = e.target.closest('.map-cell');
            if (cell) {
                const x = parseInt(cell.getAttribute('data-x'), 10);
                const y = parseInt(cell.getAttribute('data-y'), 10);
                paintCell(x, y);
            }
        });
    }

    function clearBrushActive() {
        document.querySelectorAll('#terrainByTheme .brush-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('#decorByTheme .brush-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('#layoutBrushes .brush-btn').forEach(function (b) { b.classList.remove('active'); });
    }

    function getSelectedTheme() {
        const id = (document.getElementById('themeSelect') && document.getElementById('themeSelect').value) || state.themeId;
        return THEMES.find(function (t) { return t.id === id; }) || THEMES[0];
    }

    function buildTerrainByTheme() {
        const container = document.getElementById('terrainByTheme');
        if (!container) return;
        container.innerHTML = '';
        const t = getSelectedTheme();
        if (!t) return;
        const block = document.createElement('div');
        block.className = 'theme-block';
        const title = document.createElement('div');
        title.className = 'theme-block-title';
        title.textContent = t.name;
        block.appendChild(title);
        const grid = document.createElement('div');
        grid.className = 'brush-grid';
        ['empty', 'floor'].forEach(function (type) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'brush-btn';
            btn.title = t.name + ' – ' + (type === 'floor' ? 'Sàn' : 'Trống');
            const img = type === 'floor' ? getTerrainImage(t.id, type) : null;
            if (img) {
                const i = document.createElement('img');
                i.src = img.src;
                btn.appendChild(i);
            } else {
                const span = document.createElement('span');
                span.className = 'emoji';
                span.textContent = type === 'floor' ? '🟩' : '⬜';
                btn.appendChild(span);
            }
            btn.addEventListener('click', function () {
                clearBrushActive();
                btn.classList.add('active');
                state.terrainBrush = { themeId: t.id, type: type };
                state.decorBrush = null;
                state.layoutBrush = undefined;
            });
            if (state.terrainBrush && state.terrainBrush.themeId === t.id && state.terrainBrush.type === type) btn.classList.add('active');
            grid.appendChild(btn);
        });
        block.appendChild(grid);
        container.appendChild(block);
    }

    function buildDecorByTheme() {
        const container = document.getElementById('decorByTheme');
        if (!container) return;
        container.innerHTML = '';
        const t = getSelectedTheme();
        if (!t) return;
        const theme = (ASSETS_CONFIG.themes && ASSETS_CONFIG.themes[t.id]) || {};
        const multiAssets = theme.multiCellDecorAssets || {};
        const decorTypes = [{ id: 'none', label: 'Xóa', emoji: '❌' }];
        Object.entries(multiAssets).forEach(function (entry) {
            const assetId = entry[0];
            const cfg = entry[1];
            if (cfg && (cfg.w || cfg.h)) {
                decorTypes.push({
                    id: assetId,
                    label: (cfg.w || 1) + '×' + (cfg.h || 1),
                    asset: assetId
                });
            }
        });
        const block = document.createElement('div');
        block.className = 'theme-block';
        const title = document.createElement('div');
        title.className = 'theme-block-title';
        title.textContent = t.name;
        block.appendChild(title);
        const grid = document.createElement('div');
        grid.className = 'brush-grid brush-grid-decor';
        decorTypes.forEach(function (d) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'brush-btn';
            btn.title = t.name + ' – ' + d.label;
            if (d.id === 'none') {
                const span = document.createElement('span');
                span.className = 'emoji';
                span.textContent = '❌';
                btn.appendChild(span);
            } else {
                const img = getDecorImage(t.id, d.asset);
                if (img) {
                    const i = document.createElement('img');
                    i.src = img.src;
                    btn.appendChild(i);
                } else {
                    const span = document.createElement('span');
                    span.className = 'emoji';
                    span.textContent = d.label || '🖼️';
                    btn.appendChild(span);
                }
            }
            btn.addEventListener('click', function () {
                clearBrushActive();
                btn.classList.add('active');
                state.decorBrush = { themeId: t.id, type: d.id };
                state.terrainBrush = null;
                state.layoutBrush = undefined;
            });
            if (state.decorBrush && state.decorBrush.themeId === t.id && state.decorBrush.type === d.id) btn.classList.add('active');
            grid.appendChild(btn);
        });
        block.appendChild(grid);
        container.appendChild(block);
    }

    function buildLayoutBrushes() {
        const container = document.getElementById('layoutBrushes');
        if (!container) return;
        container.innerHTML = '';
        const items = [
            { value: null, label: 'Xóa', emoji: '❌' },
            { value: 'P', label: 'Player', emoji: (ASSETS_CONFIG.player && ASSETS_CONFIG.player.emoji) || '🧙' },
            { value: 'B', label: 'Box', emoji: (ASSETS_CONFIG.specialGrids && ASSETS_CONFIG.specialGrids.box && ASSETS_CONFIG.specialGrids.box.emoji) || '🧱' },
            { value: 'L', label: 'Lava', emoji: (ASSETS_CONFIG.specialGrids && ASSETS_CONFIG.specialGrids.lava && ASSETS_CONFIG.specialGrids.lava.emoji) || '🔥' },
            { value: 'S', label: 'Swamp', emoji: (ASSETS_CONFIG.specialGrids && ASSETS_CONFIG.specialGrids.swamp && ASSETS_CONFIG.specialGrids.swamp.emoji) || '💣' },
            { value: 'C', label: 'Canon', emoji: (ASSETS_CONFIG.specialGrids && ASSETS_CONFIG.specialGrids.canon && ASSETS_CONFIG.specialGrids.canon.emoji) || '⚡' },
            { value: 'R', label: 'Princess', emoji: '👸' },
            { value: 'G', label: 'Gold', emoji: '💰' }
        ];
        ENEMY_TYPES.forEach(function (e) {
            items.push({ value: -e.value, label: e.name, emoji: (ASSETS_CONFIG.enemies && ASSETS_CONFIG.enemies[e.name] && ASSETS_CONFIG.enemies[e.name].emoji) || '👹' });
        });
        ITEM_TYPES.forEach(function (i) {
            items.push({ value: i.value, label: i.name, emoji: (ASSETS_CONFIG.items && ASSETS_CONFIG.items[i.name] && ASSETS_CONFIG.items[i.name].emoji) || '⭐' });
        });
        items.forEach(function (item) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'brush-btn';
            btn.title = item.label;
            const img = item.value !== null && item.value !== 'W' && item.value !== 'R' && item.value !== 'G' ? getLayoutImage(item.value) : null;
            if (img) {
                const i = document.createElement('img');
                i.src = img.src;
                btn.appendChild(i);
            } else {
                const span = document.createElement('span');
                span.className = 'emoji';
                span.textContent = item.emoji;
                btn.appendChild(span);
            }
            btn.addEventListener('click', function () {
                clearBrushActive();
                btn.classList.add('active');
                state.layoutBrush = item.value;
                state.terrainBrush = null;
                state.decorBrush = null;
            });
            if (state.layoutBrush === item.value) btn.classList.add('active');
            container.appendChild(btn);
        });
    }

    function buildExportMap() {
        ensureTerrainLayoutSize();
        const levelConfig = {
            level: 1,
            name: 'Custom Map',
            playerStartValue: (typeof CONFIG !== 'undefined' && CONFIG.PLAYER_START_VALUE) ? CONFIG.PLAYER_START_VALUE : 2,
            description: 'Map created in Map Editor',
            goldPerLevel: 20,
            goldPerBag: 10,
            minItems: 0,
            maxItems: 10,
            spawnTurns: 3,
            terrain: state.terrain.map(function (row) {
                return row.map(function (c) {
                    return c.type === 'empty' ? { type: 'empty' } : { themeId: c.themeId, type: c.type };
                });
            }),
            layout: state.layout.map(function (row) { return row.slice(); }),
            multiCellDecors: state.multiCellDecors.map(function (d) { return { x: d.x, y: d.y, themeId: d.themeId, assetId: d.assetId, w: d.w, h: d.h }; })
        };
        return {
            version: 1,
            width: state.width,
            height: state.height,
            levelConfig: levelConfig
        };
    }

    function exportJson() {
        const out = buildExportMap();
        const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'dicerogue-map.json';
        a.click();
        URL.revokeObjectURL(a.href);
        var status = document.getElementById('status');
        if (status) status.textContent = 'Đã export dicerogue-map.json';
    }

    function playtest() {
        var out = buildExportMap();
        try {
            sessionStorage.setItem('dicerogue_playtest_map', JSON.stringify(out));
            window.location.href = 'index.html?playtest=1';
        } catch (e) {
            alert('Không thể chạy playtest: ' + e.message);
        }
    }

    function applyLoadedMap(data) {
        state.width = data.width || state.width;
        state.height = data.height || state.height;
        state.themeId = (data.levelConfig && data.levelConfig.themeId) || state.themeId;
        state.terrain = (data.levelConfig && data.levelConfig.terrain) ? data.levelConfig.terrain : [];
        state.layout = (data.levelConfig && data.levelConfig.layout) ? data.levelConfig.layout : [];
        state.multiCellDecors = (data.levelConfig && data.levelConfig.multiCellDecors) ? data.levelConfig.multiCellDecors : [];
        ensureTerrainLayoutSize();
        var wEl = document.getElementById('mapWidth');
        var hEl = document.getElementById('mapHeight');
        var themeEl = document.getElementById('themeSelect');
        if (wEl) wEl.value = state.width;
        if (hEl) hEl.value = state.height;
        if (themeEl) themeEl.value = state.themeId;
        renderMapGrid();
        buildTerrainByTheme();
        buildDecorByTheme();
        var status = document.getElementById('status');
        if (status) status.textContent = 'Đã load map ' + state.width + '×' + state.height;
    }

    function loadJson(file) {
        const reader = new FileReader();
        reader.onload = function () {
            try {
                const data = JSON.parse(reader.result);
                applyLoadedMap(data);
            } catch (e) {
                alert('Lỗi đọc file: ' + e.message);
            }
        };
        reader.readAsText(file);
    }

    function loadMapFromFile() {
        var path = (typeof CONFIG !== 'undefined' && CONFIG.MAP_SOURCE) ? CONFIG.MAP_SOURCE : 'dicerogue-map.json';
        fetch(path).then(function (res) {
            if (!res.ok) throw new Error(res.status);
            return res.json();
        }).then(function (data) {
            applyLoadedMap(data);
        }).catch(function () {
            initBlankTerrainAndLayout();
            renderMapGrid();
            var status = document.getElementById('status');
            if (status) status.textContent = 'Không load được ' + path + ' – dùng map trống. Chọn brush và vẽ.';
        });
    }

    function resizeMap() {
        const w = parseInt(document.getElementById('mapWidth').value, 10) || 12;
        const h = parseInt(document.getElementById('mapHeight').value, 10) || 12;
        state.width = Math.max(4, Math.min(40, w));
        state.height = Math.max(4, Math.min(40, h));
        document.getElementById('mapWidth').value = state.width;
        document.getElementById('mapHeight').value = state.height;
        initBlankTerrainAndLayout();
        renderMapGrid();
    }

    function init() {
        THEMES.forEach(function (t) {
            const theme = (ASSETS_CONFIG.themes && ASSETS_CONFIG.themes[t.id]) || {};
            if (theme.gridCells && theme.gridCells.default) loadImage(theme.gridCells.default);
        });
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            THEMES.forEach(function (t) {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.name;
                themeSelect.appendChild(opt);
            });
            themeSelect.value = state.themeId;
            themeSelect.addEventListener('change', function () {
                state.themeId = themeSelect.value;
                buildTerrainByTheme();
                buildDecorByTheme();
            });
        }
        preloadEditorImages().then(function () {
            buildTerrainByTheme();
            buildDecorByTheme();
            buildLayoutBrushes();
            loadMapFromFile();
        });
        document.getElementById('btnResize').addEventListener('click', resizeMap);
        document.getElementById('btnSave').addEventListener('click', exportJson);
        var btnPlaytest = document.getElementById('btnPlaytest');
        if (btnPlaytest) btnPlaytest.addEventListener('click', playtest);
        document.getElementById('btnLoad').addEventListener('click', function () { document.getElementById('fileLoad').click(); });
        document.getElementById('fileLoad').addEventListener('change', function (e) {
            const f = e.target.files[0];
            if (f) loadJson(f);
            e.target.value = '';
        });
        var zoomSteps = [0.5, 0.75, 1, 1.25, 1.5];
        function setZoom(delta) {
            var i = zoomSteps.indexOf(state.zoom);
            if (i < 0) i = zoomSteps.indexOf(1);
            if (i < 0) i = 2;
            i = Math.max(0, Math.min(zoomSteps.length - 1, i + delta));
            state.zoom = zoomSteps[i];
            var el = document.getElementById('zoomValue');
            if (el) el.textContent = Math.round(state.zoom * 100) + '%';
            renderMapGrid();
        }
        var zoomInBtn = document.getElementById('zoomIn');
        var zoomOutBtn = document.getElementById('zoomOut');
        if (zoomInBtn) zoomInBtn.addEventListener('click', function () { setZoom(1); });
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', function () { setZoom(-1); });
        var zoomValueEl = document.getElementById('zoomValue');
        if (zoomValueEl) zoomValueEl.textContent = Math.round((state.zoom || 1) * 100) + '%';
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
