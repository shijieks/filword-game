// =====================
// UI — экраны, модалки, магазин, коллекция, победа, слияние, сундук
// =====================

let firstInteraction = false;
let pendingAfterFirst = [];

// Хелпер: SVG-монета (из data.js) или fallback
function coinIcon() {
    return (typeof COIN_SVG !== "undefined") ? COIN_SVG : "💰";
}

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
}

function openModal(title, bodyHtml, btnText, onClose) {
    const overlay = $("overlay");
    $("modalTitle").innerHTML = title || "";
    $("modalBody").innerHTML = bodyHtml || "";
    const btn = $("modalBtn");
    btn.textContent = btnText || "Продолжить";
    btn.onclick = () => {
        overlay.classList.remove("active");
        if (typeof onClose === "function") onClose();
    };
    overlay.classList.add("active");
}

function closeModal() {
    $("overlay").classList.remove("active");
}

// =====================
// ХЕЛПЕР: иконка питомца (картинка или emoji)
// =====================
function petIconHtml(pet, lvl, size) {
    size = size || 96;
    if (!pet) return `<span style="font-size:${size}px;line-height:1">🐾</span>`;
    let src = null;
    if (Array.isArray(pet.ico) && pet.ico[lvl - 1]) src = pet.ico[lvl - 1];
    if (src) {
        return `<img src="${src}" alt="${pet.name}" class="pet-img" style="width:${size}px;height:${size}px" onerror="this.style.display='none';this.parentNode.textContent='${pet.emoji || '🐾'}';">`;
    }
    return `<span style="font-size:${size}px;line-height:1">${pet.emoji || "🐾"}</span>`;
}

// =====================
// ГЛАВНЫЙ ЭКРАН
// =====================

function renderHome() {
    ensureDailyWord();
    ensureDailyQuests();
    ensureCalendar();
    ensureWeekly();
    tickPet();

    // Аватар
    const av = $("homeAvatar");
    if (av) {
        const src = avatarSrc();
        if (src) {
            av.innerHTML = `<img src="${src}" alt="avatar" onerror="this.style.display='none';this.parentNode.textContent='${state.avatar || '🦊'}';">`;
        } else {
            av.textContent = state.avatar || "🦊";
        }
    }

    // Уровень / ранг
    if ($("homeLevel")) $("homeLevel").textContent = "Уровень " + state.level;
    const rank = currentRank();
    const next = nextRank();
    if ($("rankProgress")) {
        if (rank && next) {
            const span = next.level - rank.level;
            const passed = state.level - rank.level;
            $("rankProgress").textContent = `${rank.name}: ${passed} / ${span}`;
        } else if (rank) {
            $("rankProgress").textContent = rank.name + " — максимум";
        }
    }
    if ($("rankBadge")) $("rankBadge").textContent = rank ? rank.ico || "" : "";
    if ($("rankArc")) {
        const pct = next && rank ? Math.min(100, Math.round(((state.level - rank.level) / (next.level - rank.level)) * 100)) : 100;
        $("rankArc").style.background = `conic-gradient(from 0deg, var(--accent) ${pct}%, transparent ${pct}%)`;
    }

    // Монеты
    setCoins(state.coins);

    // Раунд / прогресс
    const total = (typeof TOTAL_LEVELS !== "undefined") ? TOTAL_LEVELS : (typeof ROUNDS !== "undefined" ? ROUNDS.length : 40);
    if ($("hubRoundNum")) $("hubRoundNum").textContent = (state.roundIdx || 0) + 1;
    if ($("hubRoundOf")) $("hubRoundOf").textContent = "раунд из " + total;
    if ($("hubProgress")) {
        const pct = Math.min(100, Math.round(((state.roundIdx || 0) / total) * 100));
        $("hubProgress").style.width = pct + "%";
    }

    // Питомец на главной (мини)
    const petHome = $("petHome");
    if (petHome) {
        if (state.pet && typeof PETS !== "undefined" && PETS && PETS[state.pet]) {
            petHome.style.display = "block";
            const p = PETS[state.pet];
            const lvl = (typeof petLevel === "function") ? petLevel() : 1;
            const icoHtml = petIconHtml(p, lvl, 80);
            const mood = petMoodLevel();
            const moodIco = mood === "happy" ? "😊" : mood === "sad" ? "😢" : "😐";
            petHome.innerHTML = `<div class="pet-home-ico">${icoHtml}</div><div class="pet-home-mood">${moodIco}</div>`;
        } else {
            petHome.style.display = "none";
        }
    }

    // Бейджи на медальонах
    setBadge("dailyBadge", canClaimDaily());
    setBadge("calendarBadge", canClaimCalendar());
    setBadge("weeklyBadge", canClaimWeekly());
    setBadge("questsBadge", questsReadyCount() > 0);
    setBadge("chestBadge", state.chests > 0);
    setBadge("petBadge", state.pet && (state.petHunger < 30 || state.petMood < 30));
    setBadge("cardsBadge", false);
    setBadge("achBadge", false);

    // Сундук: медальон виден только если есть сундуки
    const chestBtn = $("chestBtn");
    if (chestBtn) chestBtn.style.display = state.chests > 0 ? "flex" : "none";

    // Кнопка «Сложный уровень» — видна, если текущий уровень поддерживает змейку
    const hardBtn = $("playHardBtn");
    if (hardBtn) {
        const R = (typeof getRound === "function") ? getRound(state.roundIdx || 0) : null;
        hardBtn.style.display = (R && R.snakeAvailable) ? "flex" : "none";
    }

    // Mute-кнопка — начальное состояние
    const muteBtn = $("muteBtn");
    if (muteBtn && typeof Sound !== "undefined") {
        const isMuted = (typeof Sound.isMuted === "function") ? Sound.isMuted() : false;
        muteBtn.textContent = isMuted ? "🔇" : "🔊";
        muteBtn.classList.toggle("muted", isMuted);
    }
}

function setBadge(id, show) {
    const el = $(id);
    if (!el) return;
    el.style.display = show ? "grid" : "none";
}

// =====================
// КНОПКИ ХАБА
// =====================

function bindHome() {
    if ($("playBtn")) $("playBtn").onclick = () => startGame(state.roundIdx || 0, { snake: false });
    if ($("playHardBtn")) $("playHardBtn").onclick = () => startGame(state.roundIdx || 0, { snake: true });
    if ($("dailyBtn")) $("dailyBtn").onclick = () => openDaily();
    if ($("calendarBtn")) $("calendarBtn").onclick = () => openCalendar();
    if ($("weeklyBtn")) $("weeklyBtn").onclick = () => openWeekly();
    if ($("questsBtn")) $("questsBtn").onclick = () => openQuests();
    if ($("chestBtn")) $("chestBtn").onclick = () => openChest();
    if ($("cardsBtn")) $("cardsBtn").onclick = () => openCollection();
    if ($("shopBtn")) $("shopBtn").onclick = () => openShop();
    if ($("achBtn")) $("achBtn").onclick = () => openAchievements();
    if ($("petBtn")) $("petBtn").onclick = () => openPet();
    if ($("backHomeBtn")) $("backHomeBtn").onclick = () => { showScreen("screen-home"); renderHome(); };
    if ($("restartBtn")) $("restartBtn").onclick = () => {
        if (typeof game !== "undefined" && game && game.active) {
            startGame(game.roundIdx, { snake: game.snakeMode });
        } else if (typeof restartRound === "function") {
            restartRound();
        }
    };
    if ($("hintBtn")) $("hintBtn").onclick = () => useHint();

    // Mute-кнопка (в игре)
    if ($("muteBtn")) {
        // начальное состояние
        if (typeof Sound !== "undefined" && typeof Sound.isMuted === "function" && Sound.isMuted()) {
            $("muteBtn").textContent = "🔇";
            $("muteBtn").classList.add("muted");
        }
        $("muteBtn").onclick = () => {
            if (typeof Sound === "undefined") return;
            const m = !Sound.isMuted();
            Sound.setMuted(m);
            $("muteBtn").textContent = m ? "🔇" : "🔊";
            $("muteBtn").classList.toggle("muted", m);
        };
    }
}

// =====================
// ПОДСКАЗКА
// =====================

function useHint() {
    if (typeof game === "undefined" || !game || typeof game.roundIdx !== "number") return;
    if (state.hints <= 0) {
        openModal("Подсказка", "У тебя нет подсказок. Купи в магазине или посмотри рекламу.", "ОК");
        return;
    }
    const R = getRound(game.roundIdx);
    if (!R || !R.words) return;
    const remaining = R.words.filter(w => !game.found.has(w));
    if (!remaining.length) {
        openModal("Подсказка", "Все слова уже найдены!", "ОК");
        return;
    }
    const word = remaining[0];
    state.hints -= 1;
    game.usedHint = true;
    saveNow();
    if (typeof revealWord === "function") revealWord(word);
    if (typeof Sound !== "undefined") Sound.hint();
    renderHome();
}

// =====================
// МАГАЗИН
// =====================

function openShop() {
    if (typeof SHOP === "undefined") return;
    let html = `<div class="shop-list">`;
    SHOP.forEach((item, i) => {
        html += `
            <div class="shop-item">
                <div class="shop-ico">${item.ico || "🛒"}</div>
                <div class="shop-info">
                    <div class="shop-name">${item.name}</div>
                    <div class="shop-desc">${item.desc || ""}</div>
                </div>
                <button class="btn-primary shop-buy" data-i="${i}">${item.price} ${coinIcon()}</button>
            </div>`;
    });
    html += `</div>`;
    openModal("🛒 Магазин", html, "Закрыть");
    document.querySelectorAll(".shop-buy").forEach(btn => {
        btn.onclick = () => buy(parseInt(btn.dataset.i, 10));
    });
}

function buy(i) {
    const item = SHOP[i];
    if (!item) return;
    if (state.coins < item.price) {
        openModal("Магазин", "Недостаточно монет.", "ОК");
        return;
    }
    state.coins -= item.price;
    if (item.type === "hint") state.hints += item.count || 1;
    else if (item.type === "chest") state.chests += item.count || 1;
    else if (item.type === "petFood") state.petFood += item.count || 1;
    else if (item.type === "petToy") state.petToys += item.count || 1;
    else if (item.type === "gender") {
        state.gender = null;
        saveNow();
        closeModal();
        openGenderChoice();
        return;
    }
    else if (item.type === "pet") {
        state.pet = null;
        saveNow();
        closeModal();
        openPetChoice();
        return;
    }
    else if (item.type === "skip") {
        state.roundIdx = (state.roundIdx || 0) + 1;
        state.unlocked = Math.max(state.unlocked || 0, state.roundIdx + 1);
    }
    saveNow();
    setCoins(state.coins);
    renderHome();
    if (typeof Sound !== "undefined") Sound.coin();
    openModal("Магазин", `Куплено: ${item.name}`, "ОК");
}

// =====================
// КОЛЛЕКЦИЯ КАРТОЧЕК
// =====================

function openCollection() {
    if (typeof CARDS === "undefined") return;
    const tier = (typeof availableTiers === "function") ? availableTiers() : ["t1"];
    const tiersHtml = tier.map(t => {
        const cards = CARDS.filter(c => c.tier === t);
        const got = cards.filter(c => hasCard(c.id)).length;
        const tierObj = (typeof TIERS !== "undefined") ? TIERS.find(x => x.id === t) : null;
        const tierName = tierObj ? tierObj.name : t;
        return `
            <div class="collection-tier">
                <div class="collection-tier-head">${tierName}: ${got} / ${cards.length}</div>
                <div class="collection-grid">
                    ${cards.map(c => {
            const cnt = cardCount(c.id);
            const info = cardLevelInfo(cnt);
            const locked = cnt === 0 ? " locked" : "";
            return `<div class="coll-card ${info.css}${locked}" data-card="${c.id}" title="${c.name}">
                            ${cardIconHtml(c, 42, cardTierLevel(cnt))}
                            <div class="coll-name">${c.name}</div>
                            <div class="coll-count">${cnt}/6</div>
                        </div>`;
        }).join("")}
                </div>
            </div>`;
    }).join("");
    openModal("🎴 Коллекция", tiersHtml || "Пока пусто", "Закрыть");

    document.querySelectorAll(".coll-card[data-card]").forEach(el => {
        el.onclick = () => showCardInfo(el.dataset.card);
    });
}

function showCardInfo(cardId) {
    const card = CARDS.find(c => c.id === cardId);
    if (!card) return;
    const cnt = cardCount(card.id);
    const info = cardLevelInfo(cnt);
    const tierObj = TIERS.find(x => x.id === card.tier);
    const tierName = tierObj ? tierObj.name : card.tier;
    const lvl = cardTierLevel(cnt);

    let html = `
        <div class="card-info">
            <div class="card-info-ico">${cardIconHtml(card, 96, lvl)}</div>
            <div class="card-info-name">${card.name}</div>
            <div class="card-info-tier">${tierName}</div>
            <div class="card-info-count">${cnt} / 6 · ${info.name}</div>`;

    if (card.fact) {
        html += `<div class="card-info-fact">${card.fact}</div>`;
    }

    if (cnt > 0 && cnt < 6) {
        html += `<div class="card-info-hint">Собери ещё ${6 - cnt} до «Алмаз» (6/6).</div>`;
    } else if (cnt >= 6) {
        html += `<div class="card-info-hint">✓ Максимальный уровень (Алмаз)</div>`;
    } else {
        html += `<div class="card-info-hint">Ещё не получена. Открой сундук или пройди уровень — карточка может выпасть (30%).</div>`;
    }

    html += `</div>`;
    openModal("🃏 " + card.name, html, "Закрыть");
}

// =====================
// ПИТОМЕЦ
// =====================

function openPet() {
    if (typeof PETS === "undefined" || !PETS) return;

    if (state.pet && !PETS[state.pet]) {
        state.pet = null;
        saveNow();
    }
    if (needsPetChoice()) {
        openPetChoice();
        return;
    }

    const pet = PETS[state.pet];
    const lvl = (typeof petLevel === "function") ? petLevel() : 1;
    const icoHtml = petIconHtml(pet, lvl, 120);

    const mood = petMoodLevel();
    const moodTxt = mood === "happy" ? "Счастлив" : mood === "sad" ? "Грустит" : "Нормально";

    const html = `
        <div class="pet-screen">
            <div class="pet-big">${icoHtml}</div>
            <div class="pet-name">${pet.name} · ур. ${lvl}</div>
            <div class="pet-mood">${moodTxt}</div>
            <div class="pet-stats">
                <div class="pet-stat"><span>🍖 Голод</span><div class="pet-bar"><div style="width:${state.petHunger}%"></div></div></div>
                <div class="pet-stat"><span>🎾 Настроение</span><div class="pet-bar"><div style="width:${state.petMood}%"></div></div></div>
                <div class="pet-stat"><span>❤️ Здоровье</span><div class="pet-bar"><div style="width:${state.petHealth}%"></div></div></div>
            </div>
            <div class="pet-inv">🍖 ${state.petFood} · 🎾 ${state.petToys}</div>
            <div class="pet-actions">
                <button class="btn-primary" id="feedBtn">🍖 Покормить</button>
                <button class="btn-primary" id="playBtnPet">🎾 Поиграть</button>
            </div>
            <div class="pet-shop-row">
                <button class="btn-ghost" id="buyFoodBtn">🍖 Купить еду · 20 ${coinIcon()}</button>
                <button class="btn-ghost" id="buyToyBtn">🎾 Купить игрушку · 15 ${coinIcon()}</button>
            </div>
            <button class="btn-ghost" id="petHelpBtn">🙏 Попросить помощь (1/день)</button>
        </div>`;
    openModal("🐾 Питомец", html, "Закрыть");

    if ($("feedBtn")) $("feedBtn").onclick = () => {
        if (feedPet()) {
            if (typeof Sound !== "undefined") Sound.coin();
            openPet();
        } else if (state.petFood <= 0) {
            openModal("Питомец", "Нет еды. Купи в магазине 🍖 (20 монет) или прямо здесь.", "ОК");
        } else {
            openModal("Питомец", "Питомец уже сыт.", "ОК");
        }
    };
    if ($("playBtnPet")) $("playBtnPet").onclick = () => {
        if (playPet()) {
            if (typeof Sound !== "undefined") Sound.coin();
            openPet();
        } else if (state.petToys <= 0) {
            openModal("Питомец", "Нет игрушек. Купи в магазине 🎾 (15 монет) или прямо здесь.", "ОК");
        } else {
            openModal("Питомец", "Питомец не хочет играть.", "ОК");
        }
    };
    if ($("buyFoodBtn")) $("buyFoodBtn").onclick = () => {
        if (state.coins < 20) { openModal("Питомец", "Не хватает монет (нужно 20).", "ОК"); return; }
        state.coins -= 20;
        state.petFood += 1;
        saveNow();
        setCoins(state.coins);
        if (typeof Sound !== "undefined") Sound.coin();
        openPet();
    };
    if ($("buyToyBtn")) $("buyToyBtn").onclick = () => {
        if (state.coins < 15) { openModal("Питомец", "Не хватает монет (нужно 15).", "ОК"); return; }
        state.coins -= 15;
        state.petToys += 1;
        saveNow();
        setCoins(state.coins);
        if (typeof Sound !== "undefined") Sound.coin();
        openPet();
    };
    if ($("petHelpBtn")) $("petHelpBtn").onclick = () => askPetHelp();
}

function openPetChoice() {
    if (typeof PETS === "undefined" || !PETS) return;
    const list = Array.isArray(PETS) ? PETS : Object.values(PETS);
    const html = `
        <div class="pet-choice">
            ${list.filter(p => p && p.name).map(p => `
                <button class="pet-choice-btn" data-pet="${p.id}">
                    <div class="pet-choice-ico">${p.emoji || "🐾"}</div>
                    <div class="pet-choice-name">${p.name}</div>
                </button>`).join("")}
        </div>`;
    openModal("Выбери питомца", html, "Закрыть");
    document.querySelectorAll(".pet-choice-btn").forEach(btn => {
        btn.onclick = () => {
            state.pet = btn.dataset.pet;
            state.petLastTick = Date.now();
            saveNow();
            closeModal();
            renderHome();
        };
    });
}

function askPetHelp() {
    if (!state.pet) return;
    if (petMoodLevel() === "sad") {
        openModal("Питомец", "Питомец грустит и не хочет помогать. Покорми и поиграй.", "ОК");
        return;
    }
    if (state.petHelpDate === todayStr()) {
        openModal("Питомец", "Сегодня питомец уже помог. Приходи завтра.", "ОК");
        return;
    }
    state.petHelpDate = todayStr();
    state.hints += 1;
    saveNow();
    if (typeof Sound !== "undefined") Sound.upgrade();
    openModal("Питомец", "Питомец нашёл подсказку! +1 💡", "ОК");
    renderHome();
}

// =====================
// КВЕСТЫ
// =====================

function openQuests() {
    ensureDailyQuests();
    const html = state.quests.map((q, i) => {
        const def = QUEST_POOL.find(d => d.id === q.id);
        if (!def) return "";
        const done = q.progress >= def.target;
        const claimed = q.claimed;
        return `
            <div class="quest-item ${claimed ? "claimed" : done ? "done" : ""}">
                <div class="quest-info">
                    <div class="quest-name">${def.name}</div>
                    <div class="quest-progress">${q.progress} / ${def.target}</div>
                </div>
                <button class="btn-primary quest-claim" data-i="${i}" ${(!done || claimed) ? "disabled" : ""}>
                    ${claimed ? "✓" : done ? "+" + def.reward : def.reward + " " + coinIcon()}
                </button>
            </div>`;
    }).join("");
    openModal("📜 Квесты", html || "Пока нет квестов", "Закрыть");
    document.querySelectorAll(".quest-claim").forEach(btn => {
        btn.onclick = () => {
            claimQuest(parseInt(btn.dataset.i, 10));
            if (typeof Sound !== "undefined") Sound.coin();
            openQuests();
            renderHome();
        };
    });
}

// =====================
// ЕЖЕДНЕВНЫЙ БОНУС
// =====================

function openDaily() {
    const day = currentDailyDay();
    if (!canClaimDaily()) {
        openModal("🎁 Ежедневный бонус", `Сегодня уже получено. Приходи завтра!`, "ОК");
        return;
    }
    const reward = DAILY_REWARDS[day - 1] || DAILY_REWARDS[0];
    const html = `
        <div class="daily-screen">
            <div class="daily-day">День ${day} из 7</div>
            <div class="daily-reward">${reward.ico || coinIcon()} ${reward.label || ""}</div>
            <button class="btn-primary" id="claimDailyBtn">Забрать</button>
        </div>`;
    openModal("🎁 Ежедневный бонус", html, "Закрыть");
    if ($("claimDailyBtn")) $("claimDailyBtn").onclick = () => claimDaily();
}

function claimDaily() {
    if (!canClaimDaily()) return;
    const day = currentDailyDay();
    const reward = DAILY_REWARDS[day - 1] || DAILY_REWARDS[0];
    if (reward.coins) state.coins += reward.coins;
    if (reward.hints) state.hints += reward.hints;
    if (reward.chests) state.chests += reward.chests;
    if (reward.petFood) state.petFood += reward.petFood;
    if (reward.petToys) state.petToys += reward.petToys;
    if (reward.card && typeof randomCard === "function") {
        const c = randomCard();
        if (c) addCard(c.id);
    }
    state.lastClaimDate = todayStr();
    state.streakDay = day;
    saveNow();
    setCoins(state.coins);
    if (typeof Sound !== "undefined") Sound.daily();
    closeModal();
    renderHome();
}

// =====================
// КАЛЕНДАРЬ
// =====================

function openCalendar() {
    ensureCalendar();
    const today = calendarTodayIndex();
    const html = `
        <div class="calendar-grid">
            ${CALENDAR_REWARDS.map((r, i) => {
        const claimed = state.calendarClaimed.includes(i);
        const isToday = i === today;
        return `<div class="cal-cell ${claimed ? "claimed" : ""} ${isToday ? "today" : ""}">
                    <div class="cal-day">${i + 1}</div>
                    <div class="cal-ico">${r.ico || coinIcon()}</div>
                </div>`;
    }).join("")}
        </div>`;
    openModal("📅 Календарь наград", html, "Закрыть");
    if (canClaimCalendar()) {
        const btn = document.createElement("button");
        btn.className = "btn-primary";
        btn.textContent = "Забрать сегодняшнюю награду";
        btn.onclick = () => claimCalendarReward();
        $("modalBody").appendChild(btn);
    }
}

function claimCalendarReward() {
    const reward = claimCalendarDay();
    if (!reward) return;
    if (reward.coins) state.coins += reward.coins;
    if (reward.hints) state.hints += reward.hints;
    if (reward.chests) state.chests += reward.chests;
    if (reward.petFood) state.petFood += reward.petFood;
    if (reward.petToys) state.petToys += reward.petToys;
    if (reward.card && typeof randomCard === "function") {
        const c = randomCard();
        if (c) addCard(c.id);
    }
    saveNow();
    setCoins(state.coins);
    if (typeof Sound !== "undefined") Sound.daily();
    closeModal();
    renderHome();
}

// =====================
// НЕДЕЛЯ
// =====================

function openWeekly() {
    ensureWeekly();
    const target = WEEKLY_QUEST.target;
    const prog = state.weeklyProgress;
    const done = prog >= target;
    const html = `
        <div class="weekly-screen">
            <div class="weekly-desc">${WEEKLY_QUEST.desc || "Собери слова всю неделю"}</div>
            <div class="weekly-bar"><div style="width:${Math.min(100, (prog / target) * 100)}%"></div></div>
            <div class="weekly-progress">${prog} / ${target}</div>
            ${done && !state.weeklyClaimed ? `<button class="btn-primary" id="claimWeeklyBtn">Забрать награду</button>` : ""}
            ${state.weeklyClaimed ? `<div class="weekly-done">✓ Награда получена</div>` : ""}
        </div>`;
    openModal("🏆 Неделя", html, "Закрыть");
    if ($("claimWeeklyBtn")) $("claimWeeklyBtn").onclick = () => {
        if (claimWeekly()) {
            state.coins += WEEKLY_QUEST.reward || 50;
            saveNow();
            setCoins(state.coins);
            if (typeof Sound !== "undefined") Sound.win();
            closeModal();
            renderHome();
        }
    };
}

// =====================
// СУНДУК
// =====================

function openChest() {
    if (state.chests <= 0) return;
    const html = `<div class="chest-screen">
        <div class="chest-big">🎁</div>
        <div class="chest-desc">У тебя ${state.chests} сундук(ов)</div>
        <button class="btn-primary" id="openChestBtn">Открыть</button>
    </div>`;
    openModal("🎁 Сундук", html, "Закрыть");
    if ($("openChestBtn")) $("openChestBtn").onclick = () => takeChestCard();
}

function takeChestCard() {
    if (state.chests <= 0) return;
    state.chests -= 1;
    const card = (typeof randomCard === "function") ? randomCard() : null;
    if (card) {
        addCard(card.id);
        state.coins += 20;
        saveNow();
        if (typeof Sound !== "undefined") Sound.chest();
        closeModal();
        openModal("🎁 Сундук", `Ты получил карточку: <b>${card.name}</b> и 20 монет!`, "ОК");
        renderHome();
    } else {
        saveNow();
        closeModal();
        renderHome();
    }
}

// =====================
// ДОСТИЖЕНИЯ
// =====================

function openAchievements() {
    const petName = (state.pet && typeof PETS !== "undefined" && PETS && PETS[state.pet]) ? PETS[state.pet].name : "нет";
    const html = `<div class="ach-screen">
        <div class="ach-item">🏆 Уровень: ${state.level}</div>
        <div class="ach-item">🎯 Пройдено: ${state.completed}</div>
        <div class="ach-item">🎴 Карточек: ${cardsCollectedCount()}</div>
        <div class="ach-item">🐾 Питомец: ${petName}</div>
        <div class="ach-item">🔥 Серия: ${state.streakDay} дней</div>
    </div>`;
    openModal("🏅 Достижения", html, "Закрыть");
}

// =====================
// ВЫБОР ПОЛА (после первого клика)
// =====================

function openGenderChoice() {
    if (!needsGenderChoice()) return;
    const html = `
        <div class="gender-choice">
            <button class="btn-primary" data-g="male">👦 Мальчик</button>
            <button class="btn-primary" data-g="female">👧 Девочка</button>
        </div>`;
    openModal("Кто ты?", html, "Пропустить");
    document.querySelectorAll("[data-g]").forEach(btn => {
        btn.onclick = () => {
            state.gender = btn.dataset.g;
            saveNow();
            closeModal();
            renderHome();
        };
    });
}

// =====================
// ПОБЕДА — экран завершения раунда
// =====================
function showVictory(data) {
    const card = data.card;
    const isGolden = data.golden;
    const isSnake = data.snake;
    const reward = data.reward || 0;

    let html = `<div class="victory-screen">`;

    html += `<div class="victory-title">${data.isLast ? "🏆 Финальный уровень!" : "🎉 Уровень пройден!"}</div>`;
    html += `<div class="victory-reward">+${reward} ${coinIcon()}</div>`;

    if (isGolden) html += `<div class="victory-badge">🌟 Золотая сетка (×2)</div>`;
    if (isSnake) html += `<div class="victory-badge">🐍 Сложный режим (×1.5)</div>`;

    html += `<div class="victory-level">Уровень ${data.level}</div>`;
    if (data.rankMsg) html += `<div class="victory-rank">${data.rankMsg}</div>`;

    if (card) {
        html += `<div class="victory-card">
            <div class="victory-card-head">🃏 Новая карточка!</div>
            <div class="victory-card-body">${cardIconHtml(card, 64, data.cardCount || 1)}</div>
            <div class="victory-card-name">${card.name}</div>
            <div class="victory-card-count">${data.cardCount || 1}/6${data.isUpgrade ? " · Улучшение!" : ""}</div>
        </div>`;
    }

    if (data.chestEarned) html += `<div class="victory-chest">🎁 +1 сундук!</div>`;
    if (data.avatarMsg) html += `<div class="victory-avatar">👤 Аватар: стадия ${data.avatarMsg}</div>`;

    html += `</div>`;

    const overlay = $("overlay");
    $("modalTitle").innerHTML = "🏆 Победа!";
    $("modalBody").innerHTML = html;

    const btn = $("modalBtn");
    btn.textContent = "▶ Следующий уровень";
    btn.onclick = () => {
        overlay.classList.remove("active");
        if (typeof Sound !== "undefined") Sound.coin();
        const nextSnake = (typeof game !== "undefined" && game) ? !!game.snakeMode : false;
        startGame(state.roundIdx || 0, { snake: nextSnake });
    };

    if (data.isLast) {
        btn.textContent = "🏠 В хаб";
        btn.onclick = () => {
            overlay.classList.remove("active");
            showScreen("screen-home");
            renderHome();
        };
    }

    $("modalBody").insertAdjacentHTML("beforeend",
        `<button class="btn-ghost" id="victoryHomeBtn" style="margin-top:4px">🏠 В хаб</button>`);
    const homeBtn = $("victoryHomeBtn");
    if (homeBtn) homeBtn.onclick = () => {
        overlay.classList.remove("active");
        showScreen("screen-home");
        renderHome();
    };

    overlay.classList.add("active");
}

// =====================
// ИНИЦИАЛИЗАЦИЯ
// =====================

function afterFirstClick() {
    if (firstInteraction) return;
    firstInteraction = true;
    pendingAfterFirst.forEach(fn => { try { fn(); } catch (e) { } });
    pendingAfterFirst = [];
}

document.addEventListener("click", afterFirstClick, { once: true });
document.addEventListener("touchstart", afterFirstClick, { once: true, passive: true });

function initUI() {
    bindHome();
    renderHome();
    if (canClaimDaily()) pendingAfterFirst.push(() => openDaily());
    else if (needsGenderChoice()) pendingAfterFirst.push(() => openGenderChoice());
}

if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initUI);
} else {
    initUI();
}