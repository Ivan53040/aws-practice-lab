# Phase 3: offline cache and Vercel deployment

階段 3 已完成，現在的 build artifact 可以作為靜態 PWA 部署。

## Offline cache

- `public/sw.js` 使用版本化 cache name：`aws-practice-lab-v3`。
- install 時快取 `/`、manifest、favicon、PWA icons，並從首頁 HTML 找出 Astro hashed JavaScript 和其他同源 asset 一起快取。
- 導覽請求使用 network-first，線上時取得最新 HTML，離線時回退到快取首頁。
- `/_astro/*`、JavaScript、CSS、圖片與 manifest 使用 cache-first。
- Vite 開發路徑（`/@vite/`、`/src/`、`/node_modules/`）不會被快取，避免本機熱更新使用舊模組。
- `localhost` 與 `127.0.0.1` 開發頁面會自動解除既有 Service Worker；只有部署後的正式網域會註冊離線快取。
- activate 時清掉舊版 `aws-practice-lab-*` cache，並呼叫 `clients.claim()`。
- service worker registration 只在瀏覽器 `load` 後執行，失敗時不阻塞正常線上使用。

## Vercel

`vercel.json` 已設定：

- framework：Astro
- build command：`npm run build`
- output directory：`dist`
- `/_astro/*` 一年 immutable cache
- `sw.js` no-cache，確保新版 service worker 能更新
- manifest revalidate headers
- 基本 `nosniff` 與 `Referrer-Policy` headers

不需要任何 Vercel secret 或 environment variable。Vercel 會以現有 `package-lock.json` 安裝依賴並部署 `dist`。

## 驗證狀態與下一步

- 本機 production preview 已驗證首頁載入、考試提交、結果頁 `Question map` 與離線快取 relaunch。
- 本機開發模式已排除 Service Worker，避免 Vite hot reload 使用舊模組。
- 手機（375px）、平板（768px）與桌面（1440px）結果頁驗證完成，三種尺寸都保留 65 個題號格且沒有水平溢出。
- 剩餘步驟是在 Vercel 帳號中匯入 `app` 專案，部署後第一次在線上開啟首頁，等待 service worker 完成註冊，再切斷網路重新整理。
