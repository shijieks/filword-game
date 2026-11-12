// =====================
// ПЛАТФОРМА — VK Mini Apps + fallback на web
// =====================

const Platform = (function () {
    let type = "web";       // "web" | "vk"
    let ready = false;

    function init() {
        if (window.vkBridge && typeof window.vkBridge.send === "function") {
            type = "vk";
            try {
                window.vkBridge.send("VKWebAppInit")
                    .then(() => { ready = true; console.log("[Platform] VK WebAppInit OK"); })
                    .catch(err => { console.warn("[Platform] VK init error:", err); ready = true; });
            } catch (e) {
                console.warn("[Platform] VK bridge error:", e);
                ready = true;
            }
        } else {
            ready = true;
            console.log("[Platform] Web mode (localStorage)");
        }
    }

    function save(json) {
        // 1) всегда в localStorage (fallback)
        try { localStorage.setItem("filword_save_v13", json); } catch (e) { }
        // 2) в VK
        if (type === "vk" && window.vkBridge) {
            try {
                window.vkBridge.send("VKWebAppStorageSet", {
                    key: "filword_save_v13",
                    value: json
                }).catch(err => console.warn("[Platform] VK save error:", err));
            } catch (e) { }
        }
    }

    function load(callback) {
        // 1) localStorage (быстро)
        let local = null;
        try { local = localStorage.getItem("filword_save_v13"); } catch (e) { }
        // 2) VK (медленно, но правильнее)
        if (type === "vk" && window.vkBridge) {
            window.vkBridge.send("VKWebAppStorageGet", { keys: ["filword_save_v13"] })
                .then(res => {
                    const keys = res.keys || [];
                    const found = keys.find(k => k.key === "filword_save_v13");
                    const vkVal = found ? found.value : null;
                    callback(vkVal || local);
                })
                .catch(err => {
                    console.warn("[Platform] VK load error:", err);
                    callback(local);
                });
        } else {
            callback(local);
        }
    }

    function getUser() {
        if (type === "vk" && window.vkBridge) {
            return window.vkBridge.send("VKWebAppGetUserInfo").catch(() => null);
        }
        return Promise.resolve(null);
    }

    return { init, save, load, getUser, get type() { return type; }, get ready() { return ready; } };
})();

// Автоинициализация при загрузке
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => Platform.init());
} else {
    Platform.init();
}