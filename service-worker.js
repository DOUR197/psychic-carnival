// 缓存名称和版本
const CACHE_NAME = 'zhou-guocheng-portfolio-v1';

// 需要缓存的资源列表
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './微信图片_20250316130746.jpg'
];

// 安装Service Worker并缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('打开缓存');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活新的Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 删除旧的缓存
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 网络请求拦截处理
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中，返回缓存的资源
        if (response) {
          return response;
        }
        
        // 缓存未命中，尝试从网络获取
        return fetch(event.request)
          .then(response => {
            // 如果响应无效或不是GET请求，直接返回响应
            if (!response || response.status !== 200 || event.request.method !== 'GET') {
              return response;
            }
            
            // 复制响应以便缓存和返回
            const responseToCache = response.clone();
            
            // 缓存新的响应
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            // 网络请求失败时，尝试返回离线页面（如果有）
            console.log('获取资源失败:', error);
            
            // 如果是HTML请求，可以返回离线页面
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// 后台同步功能
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// 模拟数据同步功能
function syncData() {
  return new Promise((resolve, reject) => {
    // 这里可以放置需要在有网络连接时进行的同步操作
    console.log('数据同步执行');
    resolve();
  });
}

// 推送通知功能
self.addEventListener('push', event => {
  const title = '周国呈个人网站';
  const options = {
    body: event.data.text() || '有新消息，请查看!',
    icon: './imgs/icon.png',
    badge: './imgs/badge.png'
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// 点击通知处理
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
}); 