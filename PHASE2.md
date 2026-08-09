# Phase 2: offline exam core

階段 2 已把原始 CloudCertPrep 入口收斂成一個可部署的靜態離線練習程式。

## 已完成

- 首頁只保留 CLF-C02 與 AIF-C01 選擇器。
- 每次開始都從本機 JSON 題庫隨機抽出 65 題，並依 certification domain proportion 分配。
- 支援 single choice、multiple response、ordering、matching 四種題型。
- 支援 90 分鐘倒數計時，時間到自動交卷。
- 使用 75% 原始答對率作為練習合格線，不冒充 AWS 官方 scaled score。
- 結果只存在目前 React 記憶體狀態，沒有帳號、API、資料庫或成績歷史。
- 結果頁列出答錯題目、使用者答案、正確答案與英文解析。
- 右上角提供 EN／中文 UI 切換；題目、選項與解析維持英文。
- PWA manifest 已改為 AWS Practice Lab 名稱與離線描述。
- 移除舊的 marketing、blog、auth、history、stats route，不再讓靜態 build 枚舉這些入口。
- build hook 只保留題庫驗證，不再執行 SEO、analytics、OG image 或 Supabase pipeline。

## 驗證

- `pnpm run build`：通過，輸出只有 `/` 與 `/404` 兩個頁面。
- `pnpm run lint`：通過。
- `pnpm run check:astro`：0 errors、0 warnings，僅有原始未使用檔案的 hints。
- `pnpm exec vitest run`：29 個 test files、318/318 tests 通過，不需要設定 Supabase env。
- 本機瀏覽器驗證：首頁、中文切換、CLF-C02 啟動、AIF-C01 ordering 與 matching 控制、結果頁與錯題解析均可載入。

## 後續狀態

階段 3 的離線快取與 Vercel deployment 設定已完成。剩餘工作是完成手機、平板與桌面版驗證，以及在 Vercel 帳號中建立正式部署後做一次線上斷網驗證。
