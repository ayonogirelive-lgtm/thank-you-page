# Google Forms X Share ボタン実装ガイド

## 概要

このドキュメントでは、Googleフォームの回答内容をXシェアボタン付きのサンキューページにリダイレクトするための実装手順を、ステップバイステップで説明します。

## 実装の流れ

```
Googleフォーム送信
    ↓
Google Apps Script (GAS) が実行
    ↓
回答内容をURLパラメータに変換
    ↓
サンキューページにリダイレクト
    ↓
URLパラメータから回答内容を取得
    ↓
Xシェアボタンに反映
```

## 前提条件

- Googleアカウント
- Googleフォーム（既存）
- サンキューページのURL（デプロイ後に取得）

## ステップ1: サンキューページをデプロイする

### 1-1. プロジェクトをビルドする

ローカル環境で以下のコマンドを実行：

```bash
cd /home/ubuntu/thank_you_page
pnpm build
```

### 1-2. デプロイする

プロジェクトをホスティングサービス（Vercel、Netlify、GitHub Pages など）にデプロイします。

デプロイ後、サンキューページのURLを取得します。例：
```
https://thank-you-page.vercel.app
```

## ステップ2: Googleフォームの回答スプレッドシートを準備する

### 2-1. スプレッドシートを作成

1. Googleフォームの編集画面を開く
2. 右上の「その他」メニュー（⋮）から「回答」を選択
3. 「スプレッドシートにリンク」をクリック
4. 新しいスプレッドシートを作成

スプレッドシートが自動作成され、フォームの回答が記録されるようになります。

## ステップ3: Google Apps Script (GAS) を設定する

### 3-1. Apps Script エディタを開く

1. 作成したスプレッドシートを開く
2. 上部メニューから「拡張機能」→「Apps Script」をクリック
3. 新しいタブで Apps Script エディタが開きます

### 3-2. コードを入力する

1. `Code.gs` ファイルの内容をすべて削除
2. 以下のコードを貼り付ける：

```javascript
// サンキューページのURL（置き換え必須）
const THANK_YOU_PAGE_URL = "https://your-thank-you-page-url.com";

// フォームの質問テキスト
const TARGET_QUESTION = "一言でいうと、リライブパワーリストバンドはあなたにとって「〇〇」";

function onFormSubmit(e) {
  try {
    const responses = e.response.getItemResponses();
    let answer = "";

    for (let i = 0; i < responses.length; i++) {
      const itemResponse = responses[i];
      const question = itemResponse.getItem().getTitle();
      
      if (question === TARGET_QUESTION) {
        answer = itemResponse.getResponse();
        break;
      }
    }

    const encodedAnswer = encodeURIComponent(answer);
    const redirectUrl = `${THANK_YOU_PAGE_URL}?answer=${encodedAnswer}`;

    logRedirectUrl(answer, redirectUrl);
    
  } catch (error) {
    Logger.log("エラーが発生しました: " + error.toString());
  }
}

function logRedirectUrl(answer, redirectUrl) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    sheet.appendRow([
      new Date(),
      answer,
      redirectUrl
    ]);
  } catch (error) {
    Logger.log("ログ記録エラー: " + error.toString());
  }
}

function setupFormSubmitTrigger() {
  const form = FormApp.getActiveForm();
  
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onFormSubmit") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  ScriptApp.newTrigger("onFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();
  
  Logger.log("トリガーが設定されました");
}

function checkFormQuestions() {
  const form = FormApp.getActiveForm();
  const items = form.getItems();
  
  Logger.log("フォームの質問一覧:");
  for (let i = 0; i < items.length; i++) {
    Logger.log((i + 1) + ". " + items[i].getTitle());
  }
}
```

### 3-3. サンキューページのURLを設定する

コードの **1行目** の `THANK_YOU_PAGE_URL` をデプロイ後のURLに置き換えます：

```javascript
const THANK_YOU_PAGE_URL = "https://thank-you-page.vercel.app";
```

### 3-4. トリガーを設定する

1. Apps Script エディタの上部にある「実行」ボタンの横の「▼」をクリック
2. 「setupFormSubmitTrigger」を選択
3. 「実行」をクリック
4. 初回実行時は、Googleアカウントへのアクセス許可を求められます。「許可」をクリック

トリガーが設定されると、フォーム送信時に自動的に `onFormSubmit` 関数が実行されます。

## ステップ4: Googleフォームの確認メッセージを設定する

### 4-1. 確認メッセージを有効にする

1. Googleフォームの編集画面を開く
2. 右上の「設定」（⚙️）をクリック
3. 「プレゼンテーション」タブを選択
4. 「フォーム送信後」で「カスタムメッセージ」を選択

### 4-2. メッセージを入力する

以下のメッセージを入力：

```
ご回答ありがとうございました！

下のボタンをクリックして、回答内容をXでシェアしてください。
```

### 4-3. リンクを設定する

「リンク」オプションを有効にし、デプロイ後のサンキューページのURLを入力：

```
https://thank-you-page.vercel.app
```

**注意**: この方法では、URLパラメータが自動的に付加されません。ユーザーがボタンをクリック後、ブラウザの戻るボタンで前のページに戻ると、URLパラメータが失われる可能性があります。

### 4-4. より確実な方法：HTMLを使用する

Googleフォームの確認メッセージでは、HTMLを直接入力することはできません。代わりに、以下の方法を検討してください：

**方法A: Google Forms Add-on を使用**
- [Form Notifications](https://workspace.google.com/marketplace/app/form_notifications/1045239268) などのアドオンを使用して、カスタムリダイレクトを実装

**方法B: Google Sites で埋め込み**
- Googleフォームを Google Sites に埋め込み、カスタムHTMLでリダイレクト機能を追加

**方法C: 本実装（推奨）**
- GAS で `doGet()` 関数を実装し、Web App として公開
- フォーム送信後、GAS Web App にリダイレクト
- GAS Web App でサンキューページにリダイレクト

## ステップ5: テストする

### 5-1. テストフォームを送信する

1. Googleフォームをプレビューモードで開く（編集画面の右上の「プレビュー」ボタン）
2. テスト回答を送信
3. 送信後の確認メッセージを確認

### 5-2. サンキューページが表示されることを確認

1. 確認メッセージのリンクをクリック
2. サンキューページが表示されることを確認
3. Xシェアボタンが表示されることを確認

### 5-3. Xシェアボタンの動作を確認

1. 「Xでシェアする」ボタンをクリック
2. Xの投稿画面が開くことを確認
3. シェア文言に回答内容が含まれていることを確認

**注意**: テスト時は、URLパラメータが付加されていない可能性があります。その場合は、以下の方法でテストしてください：

```
https://thank-you-page.vercel.app?answer=疲労リセットボタン
```

ブラウザのアドレスバーに上記URLを直接入力して、サンキューページが正しく動作することを確認してください。

## トラブルシューティング

### 問題: トリガーが実行されない

**原因**: トリガーが正しく設定されていない

**解決方法**:
1. Apps Script エディタで「実行」→「実行ログ」を確認
2. エラーメッセージが表示されていないか確認
3. `setupFormSubmitTrigger()` 関数を再度実行

### 問題: 回答内容がサンキューページに表示されない

**原因1**: URLパラメータが正しくエンコードされていない

**解決方法**:
1. ブラウザのアドレスバーを確認
2. `?answer=...` というパラメータが含まれているか確認
3. 含まれていない場合は、GAS コードを確認

**原因2**: サンキューページが URLパラメータを正しく取得していない

**解決方法**:
1. ブラウザの開発者ツール（F12）を開く
2. Console タブでエラーを確認
3. `console.log()` で URLパラメータが取得されているか確認

### 問題: Xシェアボタンが機能しない

**原因**: ブラウザがポップアップをブロックしている

**解決方法**:
1. ブラウザの設定を確認
2. ポップアップブロックを一時的に無効にしてテスト
3. または、ボタンをリンク（`<a>` タグ）に変更

## 高度な実装: Web App としてリダイレクト

より確実にURLパラメータを渡すには、GAS の Web App 機能を使用することをお勧めします。

### 実装方法

1. Apps Script エディタに以下の関数を追加：

```javascript
function doGet(e) {
  const answer = e.parameter.answer || "";
  const encodedAnswer = encodeURIComponent(answer);
  const redirectUrl = `${THANK_YOU_PAGE_URL}?answer=${encodedAnswer}`;
  
  return HtmlService.createHtmlOutput(
    `<script>window.location.href = "${redirectUrl}";</script>`
  );
}
```

2. Apps Script を Web App として公開：
   - 「デプロイ」→「新しいデプロイ」をクリック
   - 種類：「ウェブ アプリ」を選択
   - 「実行者」：「自分」を選択
   - 「アクセス」：「全員」を選択
   - 「デプロイ」をクリック

3. 公開されたウェブアプリのURLを取得

4. Googleフォームの確認メッセージのリンクを、GAS Web App のURLに変更：

```
https://script.google.com/macros/d/{SCRIPT_ID}/usercache/...?answer=...
```

この方法により、フォーム送信後、GAS Web App を経由してサンキューページにリダイレクトされます。

## 参考資料

- [Google Apps Script 公式ドキュメント](https://developers.google.com/apps-script)
- [Google Forms API リファレンス](https://developers.google.com/apps-script/reference/forms)
- [URL エンコーディング](https://ja.wikipedia.org/wiki/パーセント記号)

---

**最終更新**: 2025年10月21日

