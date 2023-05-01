// self.importScripts("/js/components/RowList.js");
// self.importScripts("/js/components/RowDict.js");
// self.importScripts("/js/CardsLang.js");
// self.importScripts("/js/CardsLangLocalData.js");
// self.importScripts("/js/cards.js");

const cacheName = "cards-v1";
const appShellFiles = [
    "/",
    "/index.html",
    "/css/cards.css",
    "/img/favicon.png",
    "/img/lluru512.png",
    "/img/llurugagulirse.png",

    "/js/components/RowList.js",
    "/js/components/RowDict.js",
    "/js/CardsLang.js",
    "/js/CardsLangLocalData.js",
    "/js/cards.js",
];

self.addEventListener("install", (e) => {
    console.log("[Service Worker] Install");
    e.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName);
            console.log("[Service Worker] Caching all: app shell and content");
            await cache.addAll(contentToCache);
        })()
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        (async () => {
            const r = await caches.match(e.request);
            console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
            if (r) {
                return r;
            }
            const response = await fetch(e.request);
            const cache = await caches.open(cacheName);
            console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
            cache.put(e.request, response.clone());
            return response;
        })()
    );
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key === cacheName) {
                        return;
                    }
                    return caches.delete(key);
                })
            );
        })
    );
});


// Listen to "push" events in the service worker.
self.addEventListener("push", (event) => {
    // Extract the unread count from the push message data.
    const message = event.data.json();
    const unreadCount = message.unreadCount;

    // Set or clear the badge.
    if (navigator.setAppBadge) {
        if (unreadCount && unreadCount > 0) {
            navigator.setAppBadge(unreadCount);
        } else {
            navigator.clearAppBadge();
        }
    }
});