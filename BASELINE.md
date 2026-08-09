# Phase 1 baseline

建立日期：2026-08-09  
來源專案 commit：`9367b00d9f5b39676f4ec3413304d91a7dccbbfb`  
授權：MIT（原始 `LICENSE` 保留）

## 目錄與依賴

- 正式專案目錄：`C:\Users\ivank\Desktop\aws\app`
- 題庫資料：`C:\Users\ivank\Desktop\aws\outputs\019fe514-72d5-7362-a018-d568784b2d75`
- 已執行 `pnpm install --lockfile=false --ignore-scripts`
- 未建立或寫入任何真實密鑰；`.env.example` 保留為原始範本

## 題庫驗證

`pnpm run validate` 通過：

- AIF-C01：419 題，無重複
- CLF-C02：1050 題，無重複
- SAA-C03：20 題，無重複
- 只有 19 個既有 SAA-C03 explanation 格式警告，沒有 validation error

## 原始程式驗證

- `pnpm run check:astro`：通過，0 errors、0 warnings、34 hints
- `pnpm run lint`：通過
- `pnpm exec vitest run`：29 個 test files、318/318 tests 通過
  - 測試只在該次程序使用非機密的 Supabase placeholder env，因為原始 auth module 要求環境變數存在；沒有持久化到檔案

## 建置基線

`pnpm run build` 尚未完成。原始 SEO prebuild script 在載入 `scripts/generate-og-images.mjs` 時找不到未列在 `package.json` 的 `sharp` 套件，因此在 Astro build 前停止。這是原始行銷／SEO pipeline 的依賴問題，不是題庫或測驗核心的失敗；階段 2 會移除不需要的 SEO、部落格與後端流程，再以離線版需求重新驗證 build。

## 工作樹狀態

完成基線清理後，來源程式工作樹沒有修改；目前唯一新增的是本份基線報告本身。
