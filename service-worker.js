// Service Worker版本号
const CACHE_VERSION = 'v1';
// 需要缓存的文件列表
const CACHE_FILES = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/NoEnvelop.png',
    '/libs/quill.snow.css',
    '/libs/quill.js',
    '/libs/FileSaver.min.js',
    '/libs/docx.min.js'
];

// 安装事件：缓存核心文件
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => {
                console.log('Service Worker: 缓存文件中...');
                return cache.addAll(CACHE_FILES);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keyList => {
                return Promise.all(keyList.map(key => {
                    if (key !== CACHE_VERSION) {
                        console.log('Service Worker: 删除旧缓存', key);
                        return caches.delete(key);
                    }
                }));
            })
            .then(() => self.clients.claim())
    );
});

// fetch事件：拦截请求并返回缓存或网络响应
self.addEventListener('fetch', (event) => {
    // 对于Chrome扩展或其他特殊请求，直接通过
    if (event.request.url.startsWith('chrome-extension://') || 
        event.request.url.includes('/_/chrome/newtab') ||
        event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 如果缓存命中，直接返回缓存的响应
                if (response) {
                    return response;
                }
                
                // 克隆请求，因为请求只能被消费一次
                const fetchRequest = event.request.clone();
                
                // 尝试从网络获取
                return fetch(fetchRequest)
                    .then(networkResponse => {
                        // 如果响应无效，直接返回网络响应
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // 克隆响应，因为响应只能被消费一次
                        const responseToCache = networkResponse.clone();
                        
                        // 将新的响应添加到缓存
                        caches.open(CACHE_VERSION)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // 如果网络请求失败，返回一个通用的离线页面（如果有）
                        return new Response('您当前处于离线状态，请检查网络连接。', {
                            headers: { 'Content-Type': 'text/plain' },
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});