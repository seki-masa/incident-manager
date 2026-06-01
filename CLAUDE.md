# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`incident-manager` — 日本全国のハザード（災害・軍事攻撃等）を地図で管理するWebアプリ。

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Map**: react-leaflet + OpenStreetMap
- **Database**: SQLite via Prisma ORM
- **Styling**: Tailwind CSS
- **Runtime**: Docker + docker-compose

## Starting the App

```bash
docker-compose up --build   # 初回
docker-compose up           # 2回目以降
```

ブラウザで http://localhost:3000 にアクセス。

Docker Desktop の WSL 統合が必要（Docker Desktop → Settings → Resources → WSL Integration）。

## Project Structure

```
src/
  app/
    page.tsx                      # メインページ（全状態管理）
    layout.tsx                    # ルートレイアウト
    api/hazards/
      route.ts                    # GET一覧 / POST作成
      [id]/route.ts               # GET / PUT / DELETE
  components/
    Map/
      JapanMap.tsx                # react-leaflet マップ本体
      HazardMarker.tsx            # DivIcon カラーマーカー
    HazardDetailPanel.tsx         # 右スライドインパネル
    HazardForm.tsx                # 新規登録モーダル
    HazardHistory.tsx             # 左サイドバー一覧
    DangerBadge.tsx               # 危険レベルバッジ
  lib/
    db.ts                         # Prismaシングルトン
    hazardColors.ts               # 色・ラベルマッピング
  types/
    hazard.ts                     # 共通型定義
prisma/
  schema.prisma                   # DBスキーマ
```

## Important Notes

- `JapanMap.tsx` は `page.tsx` で `dynamic(() => import(...), { ssr: false })` でラップすること（Leaflet SSR対応）
- マーカーは `L.divIcon` を使用（Leafletデフォルトマーカーの画像パス問題を回避）
- `leaflet/dist/leaflet.css` は `layout.tsx` でインポート
