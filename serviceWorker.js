/* serviceWorker.js */
// (参考) https://qiita.com/kaihar4/items/c09a6d73e190ab0b9b01
'use strict';

const CACHE_NAME = "board-v1";
const ORIGIN = (location.hostname == 'localhost') ? '' : location.protocol + '//' + location.hostname;

const STATIC_FILES = [
  ORIGIN + '/BgBoardApp/',
  ORIGIN + '/BgBoardApp/index.html',
  ORIGIN + '/BgBoardApp/manifest.json',
  ORIGIN + '/BgBoardApp/icon/favicon.ico',
  ORIGIN + '/BgBoardApp/icon/apple-touch-icon.png',
  ORIGIN + '/BgBoardApp/icon/android-chrome-96x96.png',
  ORIGIN + '/BgBoardApp/icon/android-chrome-192x192.png',
  ORIGIN + '/BgBoardApp/icon/android-chrome-512x512.png',
  ORIGIN + '/BgBoardApp/css/bgboardapp.css',
  ORIGIN + '/BgBoardApp/css/font-awesome-animation.min.css',
  ORIGIN + '/BgBoardApp/js/fontawesome-all.min.js',
  ORIGIN + '/BgBoardApp/js/jquery-3.4.1.min.js',
  ORIGIN + '/BgBoardApp/js/jquery-ui.min.js',
  ORIGIN + '/BgBoardApp/js/jquery.ui.touch-punch.min.js',
  ORIGIN + '/BgBoardApp/js/inobounce.min.js',
  ORIGIN + '/BgBoardApp/js/BgBoard_class.js',
  ORIGIN + '/BgBoardApp/js/BgChequer_class.js',
  ORIGIN + '/BgBoardApp/js/BgXgid_class.js',
  ORIGIN + '/BgBoardApp/js/BgUtil_class.js',
  ORIGIN + '/BgBoardApp/js/BgGame_class.js'
];

const CACHE_KEYS = [
  CACHE_NAME
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        STATIC_FILES.map(url => {
          return fetch(new Request(url, { cache: 'no-cache', mode: 'no-cors' })).then(response => {
            return cache.put(url, response);
          });
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => {
          return !CACHE_KEYS.includes(key);
        }).map(key => {
          return caches.delete(key);
        })
      );
    })
  );
});

