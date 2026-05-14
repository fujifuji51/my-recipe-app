const CACHE_NAME = 'recipe-app-v2'; // バージョンを上げて更新を促す
const DATA_CACHE_NAME = 'recipe-data-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// インストール時に基本ファイルを保存
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 通信が発生した時の処理
self.addEventListener('fetch', (e) => {
  // GASのデータ取得（API）へのリクエストかどうかを判定
  if (e.request.url.includes('script.google.com')) {
    e.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(e.request)
          .then((response) => {
            // ネットに繋がれば、最新データを保存して返す
            if (response.status === 200) {
              cache.put(e.request.url, response.clone());
            }
            return response;
          })
          .catch(() => {
            // ネットがなければ、保存していたデータを返す
            return cache.match(e.request.url);
          });
      })
    );
  } else {
    // それ以外のファイル（HTMLなど）は、保存分があればそれを、なければネットへ
    e.respondWith(
      caches.match(e.request).then((response) => {
        return response || fetch(e.request);
      })
    );
  }
});
