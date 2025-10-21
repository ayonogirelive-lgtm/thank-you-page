# Google Forms X Share ボタン設定ガイド

このガイドでは、Googleフォームの回答内容をXシェアボタン付きのサンキューページにリダイレクトする方法を説明します。

## 概要

Googleフォームの送信完了後、回答内容を含むURLパラメータを付けて外部のサンキューページにリダイレクトします。サンキューページでは、URLパラメータから回答内容を取得し、Xシェアボタンに反映させます。

## 必要な情報

- **Googleフォームの回答スプレッドシート**（既存または新規作成）
- **サンキューページのURL**（デプロイ後に取得）
- **Google Apps Script (GAS) の基本知識**

## ステップ1: Googleフォームの回答スプレッドシートを準備する

1. Googleフォームの編集画面を開く
2. 右上の「その他」メニュー（⋮）から「回答」を選択
3. 「スプレッドシートにリンク」をクリック
4. 新しいスプレッドシートを作成するか、既存のものを選択

スプレッドシートが作成されると、フォームの回答が自動的に記録されます。

## ステップ2: Google Apps Script (GAS) を設定する

### 2-1. Apps Script エディタを開く

1. スプレッドシートの上部メニューから「拡張機能」→「Apps Script」をクリック
2. Apps Script エディタが新しいタブで開きます

### 2-2. GAS コードを入力する

以下のコードを `Code.gs` ファイルに貼り付けます。**サンキューページのURLを自分のものに置き換えてください。**

```javascript
// ========================================
// Google Forms X Share Thank You Page
// ========================================

// サンキューページのURL（デプロイ後に取得したURLに置き換え）
const THANK_YOU_PAGE_URL = "https://your-thank-you-page-url.com";

// フォームの質問テキスト（正確に入力してください）
const TARGET_QUESTION = "一言でいうと、リライブパワーリストバンドはあなたにとって「〇〇」";

/**
 * フォーム送信時に実行される関数
 * @param {Object} e - フォーム送信イベントオブジェクト
 */
function onFormSubmit(e) {
  try {
    // フォームの回答を取得
    const responses = e.response.getItemResponses();
    let answer = "";

    // 対象の質問の回答を探す
    for (let i = 0; i < responses.length; i++) {
      const itemResponse = responses[i];
      const question = itemResponse.getItem().getTitle();
      
      if (question === TARGET_QUESTION) {
        answer = itemResponse.getResponse();
        break;
      }
    }

    // 回答内容をURLエンコード
    const encodedAnswer = encodeURIComponent(answer);

    // リダイレクトURL を生成
    const redirectUrl = `${THANK_YOU_PAGE_URL}?answer=${encodedAnswer}`;

    // スプレッドシートにリダイレクトURLを記録（デバッグ用）
    logRedirectUrl(answer, redirectUrl);

    // フォーム送信後、ユーザーをリダイレクト
    // 注：GASからは直接リダイレクトできないため、フォームの確認メッセージで対応
    
  } catch (error) {
    Logger.log("エラーが発生しました: " + error.toString());
  }
}

/**
 * リダイレクトURLをスプレッドシートに記録（デバッグ用）
 */
function logRedirectUrl(answer, redirectUrl) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  // 新しい行にデータを追加
  sheet.appendRow([
    new Date(),
    answer,
    redirectUrl
  ]);
}

/**
 * トリガーを設定するための関数
 * この関数を実行して、フォーム送信時のトリガーを自動設定します
 */
function setupFormSubmitTrigger() {
  const form = FormApp.getActiveForm();
  
  // 既存のトリガーを削除（重複を避けるため）
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onFormSubmit") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // 新しいトリガーを作成
  ScriptApp.newTrigger("onFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();
  
  Logger.log("トリガーが設定されました");
}
```

### 2-3. サンキューページのURLを設定する

コードの **1行目** にある `THANK_YOU_PAGE_URL` を、デプロイ後のサンキューページのURLに置き換えます。

```javascript
const THANK_YOU_PAGE_URL = "https://your-actual-thank-you-page-url.com";
```

### 2-4. トリガーを設定する

1. Apps Script エディタの上部にある「実行」ボタンの横の「▼」をクリック
2. 「setupFormSubmitTrigger」を選択して実行
3. 初回実行時は、Googleアカウントへのアクセス許可を求められます。「許可」をクリック

トリガーが設定されると、フォーム送信時に自動的に `onFormSubmit` 関数が実行されます。

## ステップ3: Googleフォームの確認メッセージを設定する

Googleフォームの標準機能では、GASからの直接リダイレクトはできません。代わりに、以下の2つの方法があります。

### 方法A: 確認メッセージにリダイレクトリンクを埋め込む（推奨）

1. Googleフォームの編集画面を開く
2. 右上の「設定」（⚙️）をクリック
3. 「プレゼンテーション」タブを選択
4. 「確認メッセージ」を有効にする
5. 以下のHTMLを確認メッセージに貼り付ける：

```html
<p>ご回答ありがとうございました！</p>
<p><a href="THANK_YOU_PAGE_URL?answer={ANSWER_PLACEHOLDER}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Xでシェアする</a></p>
```

**注意**: `{ANSWER_PLACEHOLDER}` は、Googleフォームの標準プレースホルダーではないため、別途カスタマイズが必要です。

### 方法B: カスタム確認ページにリダイレクト（より確実）

1. Googleフォームの編集画面を開く
2. 右上の「設定」（⚙️）をクリック
3. 「プレゼンテーション」タブを選択
4. 「フォーム送信後」で「カスタムメッセージ」を選択
5. 以下のメッセージを入力：

```
ご回答ありがとうございました！
下のボタンをクリックして、回答内容をXでシェアしてください。
```

6. 「リンク」オプションを有効にし、以下のURLを入力：

```
https://your-thank-you-page-url.com
```

**ただし、この方法では回答内容をURLパラメータとして渡すことができません。**

### 方法C: Google Forms Add-on を使用（最も確実）

より高度なリダイレクト機能が必要な場合は、Google Forms Add-on を使用することをお勧めします。

## ステップ4: テストする

1. Googleフォームをプレビューモードで開く
2. テスト回答を送信
3. 送信後、サンキューページにリダイレクトされることを確認
4. Xシェアボタンに回答内容が正しく反映されているか確認

## トラブルシューティング

### リダイレクトが機能しない場合

- **原因1**: `THANK_YOU_PAGE_URL` が正しく設定されていない
  - **解決**: Apps Script コードを確認し、正しいURLを入力してください

- **原因2**: フォーム送信トリガーが設定されていない
  - **解決**: `setupFormSubmitTrigger()` 関数を実行してください

- **原因3**: Googleフォームの確認メッセージが設定されていない
  - **解決**: ステップ3を参照して、確認メッセージを設定してください

### 回答内容が表示されない場合

- **原因1**: URLパラメータが正しくエンコードされていない
  - **解決**: ブラウザの開発者ツール（F12）でURLを確認してください

- **原因2**: サンキューページが URLパラメータを正しく取得していない
  - **解決**: サンキューページのコンソールでエラーを確認してください

## 参考資料

- [Google Apps Script 公式ドキュメント](https://developers.google.com/apps-script)
- [Google Forms API リファレンス](https://developers.google.com/apps-script/reference/forms)
- [URL エンコーディング](https://ja.wikipedia.org/wiki/パーセント記号)

## サポート

ご質問やトラブルが発生した場合は、以下をご確認ください：

1. Apps Script のログを確認（「実行」→「実行ログ」）
2. ブラウザのコンソールを確認（F12 → Console タブ）
3. Googleフォームの設定を再確認

---

**最終更新**: 2025年10月21日

