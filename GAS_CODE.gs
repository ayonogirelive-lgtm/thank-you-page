// ========================================
// Google Forms X Share Thank You Page
// Google Apps Script Code
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

    // ログに出力（デバッグ用）
    Logger.log("フォーム送信完了");
    Logger.log("回答: " + answer);
    Logger.log("リダイレクトURL: " + redirectUrl);
    
  } catch (error) {
    Logger.log("エラーが発生しました: " + error.toString());
  }
}

/**
 * リダイレクトURLをスプレッドシートに記録（デバッグ用）
 */
function logRedirectUrl(answer, redirectUrl) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    // 新しい行にデータを追加
    sheet.appendRow([
      new Date(),
      answer,
      redirectUrl
    ]);
  } catch (error) {
    Logger.log("ログ記録エラー: " + error.toString());
  }
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

/**
 * トリガーを削除するための関数（必要に応じて使用）
 */
function removeFormSubmitTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onFormSubmit") {
      ScriptApp.deleteTrigger(triggers[i]);
      Logger.log("トリガーが削除されました");
      return;
    }
  }
  Logger.log("削除するトリガーが見つかりません");
}

/**
 * 質問テキストを確認するための関数
 */
function checkFormQuestions() {
  const form = FormApp.getActiveForm();
  const items = form.getItems();
  
  Logger.log("フォームの質問一覧:");
  for (let i = 0; i < items.length; i++) {
    Logger.log((i + 1) + ". " + items[i].getTitle());
  }
}

