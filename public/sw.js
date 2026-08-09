const CACHE_NAME = 'aws-practice-lab-v4'
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        await cache.addAll(APP_SHELL)
        const index = await cache.match('/')
        if (!index) return
        const markup = await index.text()
        const assets = [...markup.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)]
          .map(match => match[1])
          .filter(path => path !== '/sw.js')
        await Promise.all([...new Set(assets)].map(path => cache.add(path).catch(() => {})))
      })
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('aws-practice-lab-') && key !== CACHE_NAME)
          .map(key => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  )
})

function isSameOriginGet(request) {
  return request.method === 'GET' && new URL(request.url).origin === self.location.origin
}

function isDevelopmentPath(url) {
  return url.pathname.startsWith('/@vite/')
    || url.pathname.startsWith('/src/')
    || url.pathname.startsWith('/node_modules/')
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    return (await caches.match(request)) || (await caches.match('/')) || Response.error()
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    return Response.error()
  }
}

self.addEventListener('fetch', event => {
  const { request } = event
  if (!isSameOriginGet(request)) return

  const url = new URL(request.url)
  if (isDevelopmentPath(url)) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  if (
    url.pathname.startsWith('/_astro/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/sw.js' ||
    /\.(?:png|svg|ico|webp|avif|css|js)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request))
  }
})
