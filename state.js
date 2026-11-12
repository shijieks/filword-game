// =====================
// СОСТОЯНИЕ И СОХРАНЕНИЕ
// =====================

const SAVE_KEY = "filword_save_v13";

function defaultState() {
    return {
        roundIdx: 0, unlocked: 0, coins: 0, hints: 1,
        avatar: "🦊",
        gender: null,
        collected: [], completed: 0, level: 1, clears: 0,
        lastClaimDate: null, streakDay: 0,
        cards: {}, chests: 0, lastChestLevel: 0,
        questDate: null, quests: [],
        dailyWord: null, dailyWordDate: null, dailyWordFound: false,
        calendarClaimed: [], calendarMonth: null,
        weeklyDate: null, weeklyProgress: 0, weeklyClaimed: false,
        // питомец
        pet: null,
        petHunger: 100,
        petMood: 100,
        petHealth: 100,
        petFood: 0,
        petToys: 0,
        petLastTick: null,
    };
}

let state = defaultState();

// ---- сохранение: debounce 200 мс + мгновенное ----
let saveTimer = null;

function saveNow() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    const json = JSON.stringify(state);
    try {
        localStorage.setItem(SAVE_KEY, json);
        if (window.vkBridge) {
            vkBridge.send("VKWebAppStorageSet", { key: "filword_save", value: json });
        }
    } catch (e) { }
}

function save() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 200);
}

window.addEventListener("beforeunload", saveNow);
window.addEventListener("pagehide", saveNow);
document.addEventListener("visibilitychange", () => {
    if (document.hidden) saveNow();
});

function load() {
    // 1) Синхронно из localStorage (быстро, чтобы state был готов сразу)
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) state = Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) { state = defaultState(); }

    // 2) Асинхронно из VK Bridge (если есть — перезапишет)
    if (window.vkBridge && typeof window.vkBridge.send === "function") {
        try {
            window.vkBridge.send("VKWebAppStorageGet", { keys: ["filword_save"] })
                .then(res => {
                    const keys = res.keys || [];
                    const found = keys.find(k => k.key === "filword_save");
                    const vkRaw = found ? found.value : null;
                    if (!vkRaw) return;
                    try {
                        const parsed = JSON.parse(vkRaw);
                        if (parsed && typeof parsed === "object") {
                            state = Object.assign(defaultState(), parsed);
                            // перепроверить поля
                            if (!state.level || state.level < 1) state.level = Math.max(1, state.clears || state.completed || 1);
                            if (!state.cards || typeof state.cards !== "object") state.cards = {};
                            if (!Array.isArray(state.quests)) state.quests = [];
                            if (typeof renderHome === "function") renderHome();
                            console.log("[state] VK save loaded");
                        }
                    } catch (e) { console.warn("[state] VK parse error:", e); }
                })
                .catch(err => console.warn("[state] VK load error:", err));
        } catch (e) { }
    }

    // 3) Остальные проверки state (level, cards, quests, pet) — как было
    if (!state.level || state.level < 1) state.level = Math.max(1, state.clears || state.completed || 1);

    if (Array.isArray(state.cards)) {
        const obj = {};
        state.cards.forEach(id => { obj[id] = 1; });
        state.cards = obj;
    }
    if (!state.cards || typeof state.cards !== "object") state.cards = {};

    if (!Array.isArray(state.quests)) state.quests = [];
    state.quests = state.quests.filter(q => q && q.id && typeof q.progress === "number" && typeof q.claimed === "boolean");
    if (!state.questDate) state.questDate = null;

    if (state.gender !== "male" && state.gender !== "female") state.gender = null;

    if (typeof state.dailyWordFound !== "boolean") state.dailyWordFound = false;
    if (!state.dailyWordDate) state.dailyWordDate = null;
    if (!state.dailyWord) state.dailyWord = null;

    if (!Array.isArray(state.calendarClaimed)) state.calendarClaimed = [];
    if (!state.calendarMonth) state.calendarMonth = null;

    if (typeof state.weeklyProgress !== "number") state.weeklyProgress = 0;
    if (typeof state.weeklyClaimed !== "boolean") state.weeklyClaimed = false;
    if (!state.weeklyDate) state.weeklyDate = null;

    if (state.pet !== "cat" && state.pet !== "dog" && state.pet !== "dragon") state.pet = null;
    if (typeof state.petHunger !== "number") state.petHunger = 100;
    if (typeof state.petMood !== "number") state.petMood = 100;
    if (typeof state.petHealth !== "number") state.petHealth = 100;
    if (typeof state.petFood !== "number") state.petFood = 0;
    if (typeof state.petToys !== "number") state.petToys = 0;
    if (!state.petLastTick) state.petLastTick = null;
}

load();

// =====================
// ХЕЛПЕРЫ ДЛЯ КАРТ
// =====================

function cardCount(id) { return state.cards[id] || 0; }
function hasCard(id) { return cardCount(id) > 0; }

function addCard(id) {
    state.cards[id] = (state.cards[id] || 0) + 1;
    return state.cards[id];
}

function cardTierLevel(count) {
    if (count <= 0) return 0;
    if (count >= 6) return 6;
    return count;
}

function cardLevelInfo(count) {
    const lvl = cardTierLevel(count);
    const info = [
        null,
        { name: "Обычная", css: "" },
        { name: "Бронза", css: "lvl-bronze" },
        { name: "Серебро", css: "lvl-silver" },
        { name: "Золото", css: "lvl-gold" },
        { name: "Платина", css: "lvl-platinum" },
        { name: "Алмаз", css: "lvl-diamond" },
    ];
    return info[lvl] || info[1];
}

function cardsCollectedCount() {
    return Object.keys(state.cards).filter(id => state.cards[id] > 0).length;
}

function cardIconHtml(card, size, level) {
    const sz = size || 48;
    let src = card.ico;
    if (Array.isArray(card.ico)) {
        const lvl = Math.max(1, Math.min(6, level || 1));
        src = card.ico[lvl - 1];
    }
    const isImg = typeof src === "string" && (src.includes("/") || src.includes("."));
    if (isImg) {
        return `<img src="${src}" alt="${card.name}" class="card-img" style="width:${sz}px;height:${sz}px;">`;
    }
    return `<div class="card-ico" style="font-size:${sz}px;line-height:1">${src}</div>`;
}

// =====================
// АВАТАР
// =====================

function needsGenderChoice() {
    return state.gender !== "male" && state.gender !== "female";
}

function avatarLevel() {
    const lvl = state.level;
    if (lvl >= 150) return 6;
    if (lvl >= 120) return 5;
    if (lvl >= 80) return 4;
    if (lvl >= 40) return 3;
    if (lvl >= 10) return 2;
    return 1;
}

function avatarSrc() {
    const gender = state.gender === "female" ? "female" : "male";
    const idx = avatarLevel();
    return `images/avatars/avatar_${gender}_${idx}.png`;
}

// =====================
// ПИТОМЕЦ
// =====================

function needsPetChoice() {
    return state.pet !== "cat" && state.pet !== "dog" && state.pet !== "dragon";
}

function ensurePet() {
    if (needsPetChoice()) return;
    if (!state.petLastTick) {
        state.petLastTick = Date.now();
        save();
    }
}

// падение шкал: −5 в час
function tickPet() {
    if (needsPetChoice()) return;
    if (!state.petLastTick) { state.petLastTick = Date.now(); save(); return; }
    const now = Date.now();
    const hours = (now - state.petLastTick) / 3600000;
    if (hours < 0.01) return;
    const drop = Math.floor(hours * 5);
    if (drop <= 0) return;
    state.petHunger = Math.max(0, state.petHunger - drop);
    state.petMood = Math.max(0, state.petMood - drop);
    if (state.petHunger === 0 || state.petMood === 0) {
        state.petHealth = Math.max(0, state.petHealth - Math.floor(drop / 2));
    }
    state.petLastTick = now;
    save();
}

function feedPet() {
    if (needsPetChoice()) return false;
    if (state.petFood <= 0) return false;
    if (state.petHunger >= 100) return false;
    state.petFood -= 1;
    state.petHunger = Math.min(100, state.petHunger + 20);
    if (state.petHunger > 30) state.petHealth = Math.min(100, state.petHealth + 5);
    state.petLastTick = Date.now();
    save();
    return true;
}

function playPet() {
    if (needsPetChoice()) return false;
    if (state.petToys <= 0) return false;
    if (state.petMood >= 100) return false;
    state.petToys -= 1;
    state.petMood = Math.min(100, state.petMood + 20);
    if (state.petMood > 30) state.petHealth = Math.min(100, state.petHealth + 5);
    state.petLastTick = Date.now();
    save();
    return true;
}

function petMoodLevel() {
    if (needsPetChoice()) return "none";
    const avg = (state.petHunger + state.petMood + state.petHealth) / 3;
    if (avg >= 70) return "happy";
    if (avg >= 40) return "normal";
    return "sad";
}

// =====================
// УТИЛИТЫ
// =====================

const $ = id => document.getElementById(id);
const gridEl = $("grid");

function setCoins(n) {
    const html = COIN_SVG + "<span>" + n + "</span>";
    if ($("homeCoins")) $("homeCoins").innerHTML = html;
    if ($("gameCoins")) $("gameCoins").innerHTML = html;
}

function currentRank() {
    const lvl = state.level;
    let r = null;
    for (const rank of RANKS) { if (lvl >= rank.level) r = rank; }
    return r;
}

function nextRank() {
    const lvl = state.level;
    for (const rank of RANKS) { if (lvl < rank.level) return rank; }
    return null;
}

function todayStr() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function yesterdayStr() {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function canClaimDaily() { return state.lastClaimDate !== todayStr(); }

function currentDailyDay() {
    if (state.lastClaimDate === yesterdayStr()) return Math.min(7, (state.streakDay || 0) + 1);
    return 1;
}

function tierInfo(tierId) {
    return TIERS.find(t => t.id === tierId) || TIERS[0];
}

function rnd(n) { return Math.floor(Math.random() * n); }

function rndLetter() {
    const L = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЫЭЮЯ";
    return L[rnd(L.length)];
}

// =====================
// СЛОВО ДНЯ
// =====================

function ensureDailyWord() {
    if (state.dailyWordDate === todayStr() && state.dailyWord) return;
    const pool = [];
    ROUNDS.forEach(r => {
        (r.words || []).forEach(w => {
            if (w.length >= 4 && w.length <= 9) pool.push(w);
        });
    });
    // слова из WORD_POOL (массив строк или объект {тема: [слова]})
    try {
        if (typeof WORD_POOL !== "undefined" && WORD_POOL) {
            const lists = Array.isArray(WORD_POOL) ? [WORD_POOL] : Object.values(WORD_POOL);
            lists.forEach(list => {
                if (!Array.isArray(list)) return;
                list.forEach(w => {
                    if (typeof w === "string" && w.length >= 4 && w.length <= 9) pool.push(w);
                });
            });
        }
    } catch (e) { }
    if (!pool.length) { state.dailyWord = null; return; }
    state.dailyWord = pool[rnd(pool.length)];
    state.dailyWordDate = todayStr();
    state.dailyWordFound = false;
    save();
}

function isDailyWord(word) {
    return !!state.dailyWord && word === state.dailyWord;
}

// =====================
// КАЛЕНДАРЬ НАГРАД (28 дней)
// =====================

function monthStr() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function ensureCalendar() {
    const m = monthStr();
    if (state.calendarMonth !== m) {
        state.calendarMonth = m;
        state.calendarClaimed = [];
        save();
    }
}

function calendarTodayIndex() {
    const day = new Date().getDate();
    return (day - 1) % 28;
}

function canClaimCalendar() {
    ensureCalendar();
    const idx = calendarTodayIndex();
    return !state.calendarClaimed.includes(idx);
}

function claimCalendarDay() {
    ensureCalendar();
    const idx = calendarTodayIndex();
    if (state.calendarClaimed.includes(idx)) return null;
    const reward = CALENDAR_REWARDS[idx];
    if (!reward) return null;
    state.calendarClaimed.push(idx);
    saveNow();
    return reward;
}

// =====================
// ЕЖЕНЕДЕЛЬНЫЙ КВЕСТ
// =====================

function weekStr() {
    const d = new Date();
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return d.getFullYear() + "-W" + String(week).padStart(2, "0");
}

function ensureWeekly() {
    const w = weekStr();
    if (state.weeklyDate !== w) {
        state.weeklyDate = w;
        state.weeklyProgress = 0;
        state.weeklyClaimed = false;
        save();
    }
}

function progressWeekly(amount) {
    ensureWeekly();
    if (state.weeklyClaimed) return;
    const target = WEEKLY_QUEST.target;
    if (state.weeklyProgress < target) {
        state.weeklyProgress = Math.min(target, state.weeklyProgress + (amount || 1));
        save();
    }
}

function canClaimWeekly() {
    ensureWeekly();
    return !state.weeklyClaimed && state.weeklyProgress >= WEEKLY_QUEST.target;
}

function claimWeekly() {
    ensureWeekly();
    if (state.weeklyClaimed) return false;
    if (state.weeklyProgress < WEEKLY_QUEST.target) return false;
    state.weeklyClaimed = true;
    saveNow();
    return true;
}

// =====================
// ЕЖЕДНЕВНЫЕ КВЕСТЫ
// =====================

function questsDoneCount() {
    return state.quests.filter(q => q.progress >= q.target).length;
}

function questsClaimedCount() {
    return state.quests.filter(q => q.claimed).length;
}

function questsReadyCount() {
    return state.quests.filter(q => q.progress >= q.target && !q.claimed).length;
}

function rollDailyQuests() {
    const pool = [...QUEST_POOL];
    const picked = [];
    for (let i = 0; i < 3 && pool.length; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        const q = pool.splice(idx, 1)[0];
        picked.push({ id: q.id, progress: 0, claimed: false });
    }
    state.quests = picked;
    state.questDate = todayStr();
    save();
}

function ensureDailyQuests() {
    if (state.questDate !== todayStr() || !state.quests.length) {
        rollDailyQuests();
    }
}

function progressQuests(type, amount) {
    ensureDailyQuests();
    let changed = false;
    state.quests.forEach(q => {
        const def = QUEST_POOL.find(d => d.id === q.id);
        if (!def) return;
        if (def.type === type && q.progress < def.target) {
            q.progress = Math.min(def.target, q.progress + (amount || 1));
            changed = true;
        }
    });
    if (changed) save();
}

function claimQuest(questIdx) {
    const q = state.quests[questIdx];
    if (!q) return;
    const def = QUEST_POOL.find(d => d.id === q.id);
    if (!def) return;
    if (q.progress < def.target) return;
    if (q.claimed) return;
    q.claimed = true;
    state.coins += def.reward;
    saveNow();
    setCoins(state.coins);
}

// =====================
// ТАЙМЕР ДО ПОЛУНОЧИ
// =====================

function timeToMidnight() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const diff = midnight - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h} ч ${String(m).padStart(2, "0")} мин ${String(s).padStart(2, "0")} сек`;
}
// =====================
// УРОВЕНЬ ПИТОМЦА (эволюция по уровню игрока)
// =====================
function petLevel() {
    const l = state.level || 1;
    if (l >= 120) return 6;
    if (l >= 80) return 5;
    if (l >= 40) return 4;
    if (l >= 20) return 3;
    if (l >= 10) return 2;
    return 1;
}