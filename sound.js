// =====================
// ЗВУКИ (Web Audio API)
// Генерируются в браузере, без mp3
// =====================

const Sound = (function () {
    let ctx = null;
    let muted = false;
    let unlocked = false;

    function getCtx() {
        if (!ctx) {
            try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) { return null; }
        }
        return ctx;
    }

    function tryUnlock() {
        const ac = getCtx();
        if (!ac) return;
        if (ac.state === "suspended") {
            ac.resume().then(() => { unlocked = true; }).catch(() => { });
        } else {
            unlocked = true;
        }
    }

    function playTone(freq, duration, type, volume, when) {
        const ac = getCtx();
        if (!ac || muted) return;
        if (ac.state === "suspended") {
            // Не теряем первый звук: резюмим и играем после resume
            ac.resume().then(() => {
                playTone(freq, duration, type, volume, when);
            }).catch(() => { });
            return;
        }
        const t0 = ac.currentTime + (when || 0);
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = type || "sine";
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(volume || 0.15, t0 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(t0);
        osc.stop(t0 + duration + 0.05);
    }

    function word() {
        const base = 660 + Math.random() * 60;
        playTone(base, 0.12, "sine", 0.12, 0);
        playTone(base * 1.5, 0.18, "sine", 0.1, 0.06);
    }

    function win() {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
            playTone(f, 0.22, "triangle", 0.16, i * 0.12));
        playTone(523.25, 0.6, "sine", 0.12, 0.5);
        playTone(659.25, 0.6, "sine", 0.1, 0.5);
        playTone(783.99, 0.6, "sine", 0.1, 0.5);
    }

    function fail() {
        playTone(200, 0.15, "sawtooth", 0.08, 0);
        playTone(150, 0.22, "sawtooth", 0.07, 0.08);
    }

    function hint() {
        playTone(880, 0.1, "sine", 0.1, 0);
        playTone(1100, 0.12, "sine", 0.08, 0.05);
    }

    function chest() {
        [784, 988, 1175, 1568].forEach((f, i) =>
            playTone(f, 0.18, "sine", 0.12, i * 0.08));
    }

    function daily() {
        playTone(523.25, 0.3, "triangle", 0.14, 0);
        playTone(783.99, 0.3, "triangle", 0.12, 0.1);
        playTone(1046.5, 0.5, "triangle", 0.12, 0.2);
    }

    function coin() {
        playTone(1318.5, 0.08, "square", 0.06, 0);
        playTone(1760, 0.1, "square", 0.05, 0.04);
    }

    function upgrade() {
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
            playTone(f, 0.15, "triangle", 0.12, i * 0.06));
    }

    function setMuted(v) {
        muted = !!v;
        try { localStorage.setItem("filword_muted", muted ? "1" : "0"); } catch (e) { }
    }
    function isMuted() { return muted; }
    function loadMuted() {
        try { muted = localStorage.getItem("filword_muted") === "1"; } catch (e) { }
    }
    loadMuted();

    document.addEventListener("click", tryUnlock);
    document.addEventListener("touchstart", tryUnlock, { passive: true });
    document.addEventListener("keydown", tryUnlock);

    return { word, win, fail, hint, chest, daily, coin, upgrade, setMuted, isMuted };
})();