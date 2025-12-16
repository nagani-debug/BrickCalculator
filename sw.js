const CACHE_NAME = 'brick-calc-v4';
const CACHE_NAME = 'brick-calc-v5'; // ← バージョン上げといたで
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json', // ← これ追加！
    './icon-192.png',  // ← これ追加！
    './icon-512.png'   // ← これ追加！
];
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => res || fetch(e.request))
    );
});