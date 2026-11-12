// =====================
// ЛОГИКА ИГРЫ (филворд)
// 2000 уровней + змейка ПО ВЫБОРУ (snakeMode)
// =====================

const DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];

function isGoldenRound(roundIdx) {
    return roundIdx > 0 && (roundIdx + 1) % 7 === 0;
}

function pickSnakeWords(words, count, roundIdx, excludeSet) {
    if (count <= 0) return [];
    const pool = excludeSet && excludeSet.size
        ? words.filter(w => !excludeSet.has(w))
        : [...words];
    if (!pool.length) return [];

    const seed = roundIdx * 7919;
    const arr = [...pool];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.abs((seed ^ (i * 31)) % (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, Math.min(count, arr.length));
}

// =====================
// СБОРКА СЕТКИ
// =====================
function buildGrid(size, words, snakeFlags) {
    const isSnake = w => snakeFlags && snakeFlags.has && snakeFlags.has(w);

    for (let attempt = 0; attempt < 2000; attempt++) {
        const g = Array.from({ length: size }, () => Array(size).fill(""));
        const placements = {};
        let ok = true;
        const sorted = [...words].sort((a, b) => b.length - a.length);
        for (const w of sorted) {
            if (!placeWord(g, size, w, placements, isSnake(w))) { ok = false; break; }
        }
        if (!ok) continue;
        if (Object.keys(placements).length !== words.length) continue;
        for (let r = 0; r < size; r++)
            for (let c = 0; c < size; c++)
                if (!g[r][c]) g[r][c] = rndLetter();
        return { grid: g, placements };
    }
    return null;
}

function placeWord(g, size, word, placements, snakeMode) {
    const L = word.length;
    const placed = Object.keys(placements);

    if (snakeMode) {
        for (let t = 0; t < 500; t++) {
            const r0 = rnd(size), c0 = rnd(size);
            if (g[r0][c0] && g[r0][c0] !== word[0]) continue;

            const cells = [[r0, c0]];
            let ok = true;

            for (let i = 1; i < L; i++) {
                const [pr, pc] = cells[cells.length - 1];
                const neighbors = [];

                for (const [dr, dc] of DIRS) {
                    const nr = pr + dr, nc = pc + dc;
                    if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
                    if (cells.some(([r, c]) => r === nr && c === nc)) continue;
                    const cur = g[nr][nc];
                    if (cur && cur !== word[i]) continue;
                    neighbors.push([nr, nc]);
                }

                if (!neighbors.length) { ok = false; break; }
                const [nr, nc] = neighbors[rnd(neighbors.length)];
                cells.push([nr, nc]);
            }

            if (!ok) continue;
            if (placed.length > 0) {
                const hasIntersect = cells.some(([r, c]) => g[r][c] !== "");
                if (!hasIntersect) continue;
            }

            for (let i = 0; i < L; i++) g[cells[i][0]][cells[i][1]] = word[i];
            placements[word] = cells;
            return true;
        }
        return false;
    }

    for (let t = 0; t < 500; t++) {
        const dir = DIRS[rnd(DIRS.length)];
        const r0 = rnd(size), c0 = rnd(size);
        const cells = []; let fits = true;
        for (let i = 0; i < L; i++) {
            const r = r0 + dir[0] * i, c = c0 + dir[1] * i;
            if (r < 0 || r >= size || c < 0 || c >= size) { fits = false; break; }
            const cur = g[r][c];
            if (cur && cur !== word[i]) { fits = false; break; }
            cells.push([r, c]);
        }
        if (!fits) continue;
        if (placed.length > 0) {
            const intersectCount = cells.filter(([r, c]) => g[r][c] !== "").length;
            if (intersectCount < 1) continue;
        }
        for (let i = 0; i < L; i++) g[cells[i][0]][cells[i][1]] = word[i];
        placements[word] = cells; return true;
    }
    return false;
}

function buildGridSafe(size, words, snakeCount, roundIdx, mustSnake) {
    const must = mustSnake || new Set();
    let currentWords = [...words];
    let currentMust = new Set(must);

    for (let outer = 0; outer < 10; outer++) {
        let want = Math.min(snakeCount, currentWords.length);
        for (let attempt = 0; attempt < 20; attempt++) {
            const snakeList = pickSnakeWords(currentWords, want, roundIdx, currentMust);
            const flags = new Set([...snakeList, ...currentMust]);
            const built = buildGrid(size, currentWords, flags);
            if (built) return built;
            if (want > 0) want = Math.floor(want / 2);
            else break;
        }
        if (currentMust.size === 0) break;
        const longest = [...currentMust].sort((a, b) => b.length - a.length)[0];
        currentMust.delete(longest);
        currentWords = currentWords.filter(w => w !== longest);
    }

    return buildGrid(size, currentWords, new Set());
}

// =====================
// СОСТОЯНИЕ ИГРЫ
// =====================
let game = {
    roundIdx: 0,
    found: new Set(),
    grid: [],
    placements: {},
    frags: 0,
    sel: [],
    dragging: false,
    active: false,
    usedHint: false,
    golden: false,
    snake: false,
    snakeMode: false,     // игрок выбрал сложный режим
    snakeFlags: new Set()
};

function startGame(roundIdx, opts) {
    opts = opts || {};
    game.roundIdx = Math.min(roundIdx, TOTAL_LEVELS - 1);
    game.snakeMode = !!opts.snake;
    game.active = true;
    showScreen("screen-game");
    renderRound();
}

function renderRound() {
    const R = getRound(game.roundIdx);
    game.usedHint = false;
    game.found = new Set();
    game.sel = [];
    game.dragging = false;
    game.frags = 0;
    game.golden = isGoldenRound(game.roundIdx);

    // ===== Слова уровня =====
    let allWords = R.words.concat(R.bonusWords || []);

    // ===== mustSnake: слова, которые ОБЯЗАНЫ быть змейкой =====
    let mustSnake = new Set();

    // 1) Ручные сложные уровни (ROUNDS со snake: true) — всегда змейка
    if (R.snake === true && game.roundIdx < 40) {
        const sorted = [...R.words].sort((a, b) => b.length - a.length);
        if (sorted[0]) mustSnake.add(sorted[0]);
    }

    // 2) Сложный режим по выбору игрока
    if (game.snakeMode && R.snakeAvailable) {
        // Добавляем длинное слово, если есть
        if (R.longWord && !allWords.includes(R.longWord)) {
            allWords.push(R.longWord);
            mustSnake.add(R.longWord);
        }
        // И ещё 1–2 самых длинных из обычных
        const longOnes = R.words.filter(w => w.length >= 8).sort((a, b) => b.length - a.length);
        const take = Math.min(2, longOnes.length);
        for (let i = 0; i < take; i++) mustSnake.add(longOnes[i]);
    }

    game.snake = mustSnake.size > 0;
    game.snakeFlags = mustSnake;

    // ===== СБОРКА СЕТКИ =====
    let buildSize = R.size;
    let built = buildGridSafe(buildSize, allWords, 0, game.roundIdx, mustSnake);

    // Проверяем, что ВСЕ R.words в сетке. Если нет — увеличиваем размер, пока не влезут
    function allWordsPlaced(b, words) {
        if (!b || !b.placements) return false;
        return words.every(w => !!b.placements[w]);
    }

    while ((!built || !allWordsPlaced(built, R.words)) && buildSize < R.size + 6) {
        buildSize++;
        built = buildGridSafe(buildSize, allWords, 0, game.roundIdx, mustSnake);
    }
    const size = built ? buildSize : R.size;

    if (!built) {
        const g = Array.from({ length: size }, () => Array(size).fill(""));
        const placements = {};
        allWords.forEach((w) => {
            if (w.length > size) return;
            let placed = false;
            for (let t = 0; t < 200 && !placed; t++) {
                const dir = DIRS[rnd(DIRS.length)];
                const r0 = rnd(size), c0 = rnd(size);
                const cells = [];
                let fits = true;
                for (let i = 0; i < w.length; i++) {
                    const r = r0 + dir[0] * i, c = c0 + dir[1] * i;
                    if (r < 0 || r >= size || c < 0 || c >= size) { fits = false; break; }
                    if (g[r][c]) { fits = false; break; }
                    cells.push([r, c]);
                }
                if (!fits) continue;
                for (let i = 0; i < w.length; i++) g[cells[i][0]][cells[i][1]] = w[i];
                placements[w] = cells;
                placed = true;
            }
        });
        for (let r = 0; r < size; r++)
            for (let c = 0; c < size; c++)
                if (!g[r][c]) g[r][c] = rndLetter();
        game.grid = g;
        game.placements = placements;
        game.snakeFlags = new Set();
        game.snake = false;
    } else {
        game.grid = built.grid;
        game.placements = built.placements;
    }

    // ===== Шапка =====
    $("theme").textContent = R.theme
        + (game.golden ? " 🌟" : "")
        + (game.snake ? " 🐍" : "");

    // ===== Размеры клеток =====
    const wrap = document.querySelector(".grid-wrap");
    const wrapRect = wrap.getBoundingClientRect();
    const gap = 4;
    const padding = 20;
    const availableWidth = wrapRect.width - padding;
    const cellSize = Math.max(16, Math.min(56, Math.floor((availableWidth - (size - 1) * gap) / size)));

    gridEl.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
    gridEl.style.gap = gap + "px";
    gridEl.innerHTML = "";
    if (game.golden) gridEl.classList.add("golden-grid");
    else gridEl.classList.remove("golden-grid");

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const d = document.createElement("div");
            d.className = "cell" + (game.golden ? " golden" : "");
            d.textContent = game.grid[r][c];
            d.dataset.r = r;
            d.dataset.c = c;
            d.style.width = cellSize + "px";
            d.style.height = cellSize + "px";
            d.style.fontSize = Math.floor(cellSize * 0.45) + "px";
            gridEl.appendChild(d);
        }
    }

    // ===== Список слов =====
    $("words").innerHTML = "";
    R.words.forEach(w => {
        const s = document.createElement("span");
        s.className = "word";
        s.textContent = w;
        s.dataset.word = w;
        $("words").appendChild(s);
    });

    // ===== Фрагменты =====
    $("frags").innerHTML = "";
    for (let i = 0; i < 4; i++) {
        const f = document.createElement("div");
        f.className = "frag";
        f.textContent = ["◔", "◑", "◕", "●"][i];
        $("frags").appendChild(f);
    }

    updateProgress();
    $("msg").textContent = "";
    setCoins(state.coins);

    ensureDailyWord();
    ensureWeekly();

    if (game.golden) {
        $("msg").textContent = "🌟 Золотая сетка! Награда ×2 за раунд";
    }
    if (game.snake) {
        $("msg").textContent += (game.golden ? " · " : "") + "🐍 Сложный режим! Слова могут поворачивать";
    }
    if (state.dailyWord && !state.dailyWordFound && R.words.includes(state.dailyWord)) {
        $("msg").textContent += ((game.golden || game.snake) ? " · " : "") + `🌟 Слово дня: «${state.dailyWord}» ×5`;
    }

    if (R.tutorial) {
        const firstWord = R.words[0];
        const cells = game.placements[firstWord];
        $("msg").textContent = "Проведите пальцем/мышью по буквам. Попробуйте: «" + firstWord + "»";
        if (cells) cells.forEach(([r, c]) => {
            const el = cellEl(r, c);
            if (el) {
                el.classList.add("hint");
                setTimeout(() => el.classList.remove("hint"), 2500);
            }
        });
    }
}

// =====================
// РАБОТА С КЛЕТКАМИ
// =====================
function cellEl(r, c) {
    return gridEl.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

function cellFromEvent(e) {
    const t = e.touches ? e.touches[0] : e;
    const el = document.elementFromPoint(t.clientX, t.clientY);
    if (!el || !el.classList.contains("cell")) return null;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = t.clientX - cx;
    const dy = t.clientY - cy;
    const maxDist = rect.width * 0.42;
    if (Math.abs(dx) > maxDist || Math.abs(dy) > maxDist) return null;
    return { r: +el.dataset.r, c: +el.dataset.c };
}

function startSel(e) {
    if (!game.active) return;
    const p = cellFromEvent(e);
    if (!p) return;
    e.preventDefault();
    game.dragging = true;
    game.sel = [p];
    paintSel();
}

function moveSel(e) {
    if (!game.dragging) return;
    e.preventDefault();
    const p = cellFromEvent(e);
    if (!p) return;
    const last = game.sel[game.sel.length - 1];
    if (!last) return;
    if (last.r === p.r && last.c === p.c) return;

    const dr = p.r - last.r;
    const dc = p.c - last.c;
    if (Math.abs(dr) > 1 || Math.abs(dc) > 1) return;

    if (game.sel.length > 1) {
        const prev = game.sel[game.sel.length - 2];
        if (prev.r === p.r && prev.c === p.c) {
            game.sel.pop();
            paintSel();
            return;
        }
    }

    if (game.sel.some(x => x.r === p.r && x.c === p.c)) return;
    game.sel.push(p);
    paintSel();
}

function endSel() {
    if (!game.dragging) return;
    game.dragging = false;
    if (!game.sel.length) return;
    const word = game.sel.map(p => game.grid[p.r][p.c]).join("");
    const rev = [...word].reverse().join("");
    const R = getRound(game.roundIdx);
    const allWords = R.words.concat(R.bonusWords || []).concat(game.snakeMode && R.longWord ? [R.longWord] : []);
    const target = allWords.find(w => w === word || w === rev);
    if (target && !game.found.has(target)) {
        markFound(target);
    } else {
        if (game.sel.length > 2) Sound.fail();
        game.sel = [];
        paintSel();
    }
}

function paintSel() {
    gridEl.querySelectorAll(".cell").forEach(el => el.classList.remove("sel"));
    game.sel.forEach(p => {
        const el = cellEl(p.r, p.c);
        if (el) el.classList.add("sel");
    });
}

// =====================
// НАЙДЕНО СЛОВО
// =====================
function markFound(word) {
    const R = getRound(game.roundIdx);
    const allBonus = (R.bonusWords || []);
    const isBonus = allBonus.includes(word);
    const isDaily = isDailyWord(word) && !state.dailyWordFound;

    game.found.add(word);

    game.sel.forEach(p => {
        const el = cellEl(p.r, p.c);
        if (el) {
            el.classList.remove("sel");
            el.classList.add(isBonus ? "bonus" : "found");
        }
    });
    game.sel = [];

    if (isBonus) {
        const bonus = game.golden ? 100 : 50;
        state.coins += bonus;
        let petMsg = "";
        if (!needsPetChoice()) {
            if (Math.random() < 0.5) { state.petFood += 1; petMsg = " · 🍖 +1 еда"; }
            else { state.petToys += 1; petMsg = " · 🎾 +1 игрушка"; }
        }
        save();
        setCoins(state.coins);
        Sound.win();
        $("msg").textContent = `🎁 Бонусное слово «${word}»! +${bonus} монет${game.golden ? " (×2)" : ""}${petMsg}`;
        setTimeout(() => {
            gridEl.querySelectorAll(".cell.bonus").forEach(el => el.classList.remove("bonus"));
        }, 2000);
        return;
    }

    if (isDaily) {
        state.dailyWordFound = true;
        const bonus = game.golden ? 100 : 50;
        state.coins += bonus;
        save();
        setCoins(state.coins);
        Sound.win();
        $("msg").textContent = `🌟 Слово дня «${word}»! ×5 (+${bonus} монет)${game.golden ? " + ×2" : ""}`;
    }

    Sound.word();
    progressQuests("words", 1);
    progressWeekly(1);

    const wEl = $("words").querySelector(`[data-word="${word}"]`);
    if (wEl) wEl.classList.add("found");

    const need = R.tutorial ? 1 : Math.max(1, Math.ceil(R.words.length / 4));
    const normalFound = R.words.filter(w => game.found.has(w)).length;
    const newFrags = Math.min(4, Math.floor(normalFound / need));
    if (newFrags > game.frags) {
        game.frags = newFrags;
        progressQuests("frags", 1);
        const fEls = $("frags").children;
        if (fEls[game.frags - 1]) fEls[game.frags - 1].classList.add("on");
        if (!isDaily) {
            $("msg").textContent = `Фрагмент ${game.frags}/4 предмета «${R.itemName}» найден!`;
        }
    }

    updateProgress();
    if (normalFound === R.words.length) finishRound();
}

function updateProgress() {
    const R = getRound(game.roundIdx);
    const normalFound = R.words.filter(w => game.found.has(w)).length;
    $("progress").style.width = (normalFound / R.words.length * 100) + "%";
}

function avatarLevelByLvl(lvl) {
    if (lvl >= 150) return 6;
    if (lvl >= 120) return 5;
    if (lvl >= 80) return 4;
    if (lvl >= 40) return 3;
    if (lvl >= 10) return 2;
    return 1;
}

// =====================
// ЗАВЕРШЕНИЕ РАУНДА
// =====================
function finishRound() {
    const R = getRound(game.roundIdx);
    // Сложный режим — награда ×1.5
    let reward = game.golden ? R.reward * 2 : R.reward;
    if (game.snakeMode) reward = Math.round(reward * 1.5);

    progressQuests("rounds", 1);
    progressQuests("themes", 1);
    if (!game.usedHint) progressQuests("noHint", 1);

    state.coins += reward;
    state.completed += 1;
    state.clears += 1;
    const oldLevel = state.level;
    state.level = Math.max(state.level, state.clears);

    const oldChests = state.chests;
    checkChestReward();
    const chestEarned = state.chests > oldChests;

    if (!state.collected.includes(game.roundIdx)) state.collected.push(game.roundIdx);
    if (game.roundIdx + 1 > state.unlocked) state.unlocked = game.roundIdx + 1;

    const willDropCard = Math.random() < 0.3;
    let droppedCard = null;
    let droppedCount = 0;
    if (willDropCard) {
        droppedCard = randomCard();
        if (droppedCard) droppedCount = addCard(droppedCard.id);
    }

    const oldAvLvl = avatarLevelByLvl(oldLevel);
    const newAvLvl = avatarLevelByLvl(state.level);
    const avatarMsg = (newAvLvl > oldAvLvl) ? newAvLvl : null;

    state.roundIdx = Math.min(game.roundIdx + 1, TOTAL_LEVELS - 1);
    if (typeof renderHome === "function") renderHome();
    saveNow();
    setCoins(state.coins);
    [...$("frags").children].forEach(f => f.classList.add("on"));

    const isLast = game.roundIdx === TOTAL_LEVELS - 1;
    let rankMsg = "";
    const oldRank = RANKS.filter(r => oldLevel >= r.level).pop();
    const newRank = RANKS.filter(r => state.level >= r.level).pop();
    if (newRank && (!oldRank || newRank.id !== oldRank.id)) {
        rankMsg = `🏅 Открыт ранг: ${newRank.name}!`;
    }

    let weeklyChest = false;
    if (canClaimWeekly()) {
        claimWeekly();
        state.chests += 1;
        saveNow();
        weeklyChest = true;
    }

    Sound.win();
    // Эволюция питомца
    if (state.pet) {
        const oldPetLvl = (typeof petLevel === "function")
            ? (function (prevLevel) {
                if (prevLevel >= 120) return 6;
                if (prevLevel >= 80) return 5;
                if (prevLevel >= 40) return 4;
                if (prevLevel >= 20) return 3;
                if (prevLevel >= 10) return 2;
                return 1;
            })(oldLevel)
            : 1;
        const newPetLvl = (typeof petLevel === "function") ? petLevel() : 1;
        if (newPetLvl > oldPetLvl) {
            // показать после победы
            setTimeout(() => {
                if (typeof Sound !== "undefined") Sound.upgrade();
                const petName = (typeof PETS !== "undefined" && PETS[state.pet]) ? PETS[state.pet].name : "Питомец";
                if (typeof openModal === "function") {
                    openModal(
                        "🐾 Питомец вырос!",
                        `<div style="text-align:center">
                        <div style="font-size:48px;margin:8px 0">${(PETS[state.pet].ico && PETS[state.pet].ico[newPetLvl - 1]) ? `<img src="${PETS[state.pet].ico[newPetLvl - 1]}" style="width:96px;height:96px;object-fit:contain">` : (PETS[state.pet].emoji || "🐾")}</div>
                        <div>${petName} достиг <b>стадии ${newPetLvl}</b>!</div>
                    </div>`,
                        "Ура!"
                    );
                }
            }, 800);
        }
    }
    showVictory({
        round: R,
        card: droppedCard,
        cardCount: droppedCount,
        isUpgrade: droppedCount >= 2,
        reward: reward,
        level: state.level,
        rankMsg: rankMsg,
        isLast: isLast,
        avatarMsg: avatarMsg,
        chestEarned: chestEarned || weeklyChest,
        golden: game.golden,
        snake: game.snakeMode
    });
}

function checkChestReward() {
    if (state.level > 0 && state.level % 5 === 0 && state.level !== state.lastChestLevel) {
        state.chests += 1;
        state.lastChestLevel = state.level;
        save();
    }
}

function availableTiers() {
    return TIERS.filter(t => state.level >= t.minLevel).map(t => t.id);
}

function randomCard() {
    const tiers = availableTiers();
    if (!tiers.length) return null;
    const weights = tiers.map((t, i) => Math.max(1, 60 - i * 12));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let picked = tiers[0];
    for (let i = 0; i < tiers.length; i++) {
        r -= weights[i];
        if (r <= 0) { picked = tiers[i]; break; }
    }
    const pool = CARDS.filter(c => c.tier === picked.id);
    return pool[Math.floor(Math.random() * pool.length)];
}

// =====================
// СОБЫТИЯ СВАЙПА
// =====================
gridEl.addEventListener("pointerdown", startSel);
gridEl.addEventListener("pointermove", moveSel);
window.addEventListener("pointerup", endSel);

// =====================
// ПОДСКАЗКА — подсветить слово
// =====================
function revealWord(word) {
    if (!game || !game.placements || !game.placements[word]) return;
    const cells = game.placements[word];
    cells.forEach(([r, c]) => {
        const el = cellEl(r, c);
        if (el) {
            el.classList.add("hint");
            setTimeout(() => el.classList.remove("hint"), 2500);
        }
    });
}