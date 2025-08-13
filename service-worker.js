const CACHE = 'faith-quest-cache-v1';
const ASSETS = [
  'index.html','categories.html','books.html','levels.html','quiz.html','results.html','about.html',
  'css/style.css','js/splash.js','js/quiz.js','questions.js','manifest.json'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e=> e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});
