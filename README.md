# ビデオプレーヤー with EDLプレビュー

このプロジェクトは、EDL（Edit Decision List）ファイルとSRT（SubRip Subtitle）ファイルを使用して、GoPro動画をプレビューするウェブアプリケーションです。Node.jsの`http-server`を使用してバックエンドを構築し、フロントエンドで動画再生とシーン管理を行います。

## 概要

このアプリケーションは、以下を提供します：
- EDLファイルとSRTファイルのアップロード・解析
- シーンごとのタイムライン表示（最大10行、スクロールバー付き）
- 対応する動画ファイルのプレビュー再生
- シンプルなUIで画面中央に配置

バックエンドには軽量なHTTPサーバー（`http-server`）を使用し、GoProのMP4ファイル（`100GPRO`フォルダ内）を配信します。

## 前提条件

### フロントエンド
- 最新のウェブブラウザ（Chrome、Firefox、Safariなど）

### バックエンド（HTTPサーバー）
- Node.js (v16 以上推奨)
- npm
- GoProメディアファイル（MP4形式、`100GPRO`フォルダ内に保存）

## インストール

### バックエンド（HTTPサーバー）

1. Node.jsとnpmがインストールされていることを確認します。

2. プロジェクトディレクトリに移動します。

3. `http-server`パッケージをインストールします：
   ```bash
   npm install http-server
   ```

### フロントエンド

フロントエンドファイルは既にこのリポジトリに含まれています。

## 使い方

### バックエンドのセットアップ

1. Gドライブのプロジェクトディレクトリに動画ファイル（MP4）を直接配置します。

2. ターミナルでGドライブのプロジェクトディレクトリに移動します：
   ```bash
   cd G:\your_project_folder
   ```

3. 以下のコマンドを実行してHTTPサーバーを起動します：
   ```bash
   npx http-server -p 8000
   ```

4. サーバーが起動すると、以下のURLでアクセス可能になります：
   ```
   http://localhost:8000
   ```

5. 動画ファイルには以下の形式でアクセスできます：
   ```
   http://localhost:8000/FILENAME.MP4
   ```
   例: `http://localhost:8000/GHD1Z624.MP4`

### フロントエンドの使用

1. ブラウザで`http://localhost:8000/index.html`にアクセスします。

2. 「EDLファイル」と「SRTファイル」の選択欄から、それぞれ`combined.edl`と`combined.srt`をアップロードします。

3. 読み込まれたシーンが画面下部のタイムライン（最大10行、スクロールバー付き）に表示されます。

4. 各シーンの「プレビュー」ボタンをクリックして、対応する動画を再生できます。

## デモと参考

このプロジェクトの使用例やデモ動画は以下で確認できます：
- [YouTube: ビデオプレーヤー with EDLプレビュー デモ](https://youtu.be/9JIjswyRWH8)

## ファイル構造

```
project/
├── index.html           # フロントエンドHTML
├── static/
│   ├── css/
│   │   └── style.css    # スタイルシート
│   └── js/
│       └── script.js     # JavaScriptコード
└── 100GPRO/             # GoPro動画ファイル（MP4）
    ├── GH012562.MP4    # 例: 動画ファイル
    └── ...
```

## 重要な設定

- **動画ファイルパス**: 動画は`http://localhost:8000/FILENAME.MP4`形式でアクセスする必要があります。ファイル名の大文字小文字に注意してください。
- **タイムライン**: 画面下部に10行で表示され、超過分はスクロールバーで確認できます。
- **デザイン**: 画面全体が中央に配置され、シンプルで視認性の高いデザインです。

## よくある問題

### 404エラー
- `100GPRO`フォルダが正しいパスにあるか確認してください。
- ファイル名（例：`GH012562.MP4`）の大文字小文字が一致しているか確認してください。
- サーバーが正しいディレクトリから起動しているか確認してください。  `npx http-server` コマンドを実行する前に、プロジェクトのルートディレクトリにいることを確認してください。

### 動画再生の問題
- ブラウザがMP4コーデックをサポートしているか確認してください。
- 別のブラウザを試してみてください。
- ネットワーク接続を確認してください。

### SRT/EDLの読み込みエラー
- ファイル形式が正しいか（EDLはCMX3600形式、SRTはSubRip形式）確認してください。
- SRTの`number`がEDLのシーン順と一致しているか確認してください。

## サーバーの停止

ターミナルで`Ctrl+C`を押してサーバーを停止します。

## ライセンス

このプロジェクトはMITライセンスに基づいています。
