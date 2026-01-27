# KnowYourCodeWeb

React + TypeScript + Vite で構築されたWebアプリケーションです。

## 前提条件

- **Git**: リポジトリのクローンに必要
- **Docker**: デプロイスクリプトが自動でインストールを案内します（未インストールの場合）

## デプロイ方法

### 1. リポジトリをクローン

```bash
git clone <リポジトリURL>
cd KnowYourCodeWeb
```

### 2. デプロイスクリプトを実行

```bash
./deploy.sh
```

これだけでデプロイが完了します。

## デプロイスクリプトの動作

`deploy.sh` は以下の処理を自動で行います：

1. **依存関係のチェック**
   - Git と Docker がインストールされているか確認
   - Docker が未インストールの場合、インストールを案内

2. **Firebase設定のチェック**
   - `src/firebase/firebase.ts` の存在確認
   - 存在しない場合、テンプレートからファイルを作成

3. **Dockerでのデプロイ**
   - 最新のコードを `git pull` で取得
   - Docker イメージをビルド
   - コンテナを起動（ポート80）

## Firebase設定

初回デプロイ時、Firebase設定が必要です。スクリプトが自動で `src/firebase/firebase.ts` を作成しますが、以下の値を設定する必要があります。

### 設定手順

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択（または新規作成）
3. プロジェクト設定（歯車アイコン）をクリック
4. 「マイアプリ」セクションまでスクロール
5. Webアプリがない場合は「アプリを追加」→ Web（</>）を選択
6. 表示された `firebaseConfig` の値を `src/firebase/firebase.ts` にコピー

### 必要な設定値

```typescript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID",  // オプション（アナリティクス用）
};
```

設定完了後、再度 `./deploy.sh` を実行してください。

## 便利なコマンド

### コンテナのログを確認
```bash
docker logs -f knowyourcodewebcontainer
```

### コンテナを停止
```bash
docker stop knowyourcodewebcontainer
```

### コンテナを再起動
```bash
docker restart knowyourcodewebcontainer
```

### コンテナの状態を確認
```bash
docker ps
```

## アクセス方法

デプロイ完了後、ブラウザで以下のURLにアクセスしてください：

```
http://localhost
```

または、サーバーのIPアドレス/ドメインでアクセスできます。

## トラブルシューティング

### Docker が起動していない（macOS）
Docker Desktop を手動で起動してから、再度 `./deploy.sh` を実行してください。

### ポート80が使用中
他のアプリケーションがポート80を使用している可能性があります。使用中のプロセスを確認してください：
```bash
sudo lsof -i :80
```

### Firebase設定エラー
`src/firebase/firebase.ts` のプレースホルダー（`YOUR_API_KEY` など）が実際の値に置き換えられているか確認してください。
