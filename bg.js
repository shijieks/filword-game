// =====================
// ФОН: время суток + картинки-пейзажи + частицы
// =====================

(function () {
    const TIMES = ["morning", "day", "evening", "night"];

    // Пути к картинкам. Если файлов нет — bg.js оставит CSS-градиент.
    const BG_URL = {
        morning: "images/bg/morning.jpg",
        day: "images/bg/day.jpg",
        evening: "images/bg/evening.jpg",
        night: "images/bg/night.jpg"
    };

    // --- 1. Определяем время суток по часам ---
    function timeOfDay(h) {
        if (h >= 5 && h < 11) return "morning";
        if (h >= 11 && h < 17) return "day";
        if (h >= 17 && h < 22) return "evening";
        return "night";
    }

    function applyTime() {
        const t = timeOfDay(new Date().getHours());
        if (document.body.dataset.time !== t) {
            document.body.dataset.time = t;
        }
        applyBgImage(t);
    }

    // --- 2. Картинка в .landscape-sky (если есть) ---
    const imgCache = {}; // { morning: true/false, ... }

    function preload() {
        TIMES.forEach(t => {
            const img = new Image();
            img.onload = () => { imgCache[t] = true; };
            img.onerror = () => { imgCache[t] = false; };
            img.src = BG_URL[t];
        });
    }

    function applyBgImage(t) {
        const sky = document.querySelector(".landscape-sky");
        if (!sky) return;

        // если уже стоит эта картинка — не трогаем
        if (sky.dataset.bg === t) return;

        // если картинки нет — оставляем CSS-градиент
        if (imgCache[t] === false) {
            sky.dataset.bg = t;
            sky.style.backgroundImage = "";
            return;
        }

        // ставим картинку + лёгкое затемнение снизу (для читаемости UI)
        sky.dataset.bg = t;
        sky.style.backgroundImage =
            "linear-gradient(180deg, rgba(5,10,22,0.05) 0%, rgba(5,10,22,0.25) 70%, rgba(5,10,22,0.55) 100%), " +
            "url('" + BG_URL[t] + "')";
        sky.style.backgroundSize = "cover, cover";
        sky.style.backgroundPosition = "center, center";
        sky.style.backgroundRepeat = "no-repeat, no-repeat";
    }

    // --- 3. Частицы на canvas (снег/пыль) ---
    function initParticles() {
        const canvas = document.getElementById("particles");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
        let parts = [];

        function resize() {
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(60, Math.max(20, Math.floor(w * h / 18000)));
            parts = [];
            for (let i = 0; i < count; i++) {
                parts.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: 0.6 + Math.random() * 1.6,
                    vx: -0.15 + Math.random() * 0.3,
                    vy: 0.15 + Math.random() * 0.5,
                    a: 0.15 + Math.random() * 0.45
                });
            }
        }

        function tick() {
            ctx.clearRect(0, 0, w, h);
            const night = document.body.dataset.time === "night";
            for (const p of parts) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.y > h + 4) { p.y = -4; p.x = Math.random() * w; }
                if (p.x < -4) p.x = w + 4;
                if (p.x > w + 4) p.x = -4;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = night
                    ? "rgba(200, 220, 255, " + p.a + ")"
                    : "rgba(255, 255, 255, " + (p.a * 0.8) + ")";
                ctx.fill();
            }
            requestAnimationFrame(tick);
        }

        window.addEventListener("resize", resize);
        resize();
        tick();
    }

    // --- 4. Старт ---
    function boot() {
        preload();
        applyTime();
        initParticles();
        // обновляем время раз в минуту (в 18:00 переключится на вечер)
        setInterval(applyTime, 60 * 1000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();