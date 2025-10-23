import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Share2, CheckCircle } from "lucide-react";

export default function Home() {
  const [answer, setAnswer] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // URLパラメータから回答内容を取得
    const params = new URLSearchParams(window.location.search);
    const answerParam = params.get("answer") || "";
    
    // URLデコード
    try {
      const decodedAnswer = decodeURIComponent(answerParam);
      setAnswer(decodedAnswer);
    } catch (e) {
      setAnswer(answerParam);
    }
  }, []);

  const shareText = `私にとってのリライブパワーリストバンドは「${answer}」！

新技術 #リライブエンジン 搭載の #リライブパワーリストバンド １万個無料配布プロジェクト実施中！
詳細・ご応募はこちらから👉　https://x.gd/HapjS
#みんなでエンジン始動 #その動きエンジンがかかる`;
  // XシェアではURLを含めない（shareTextに既に含まれているため）
  
  // Xシェアリンク生成（URLはshareTextに含まれているため、url パラメータは不要）
  const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* チェックマーク */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* ありがとうメッセージ */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            ご回答ありがとうございました！
          </h1>
          <p className="text-center text-gray-600 mb-8">
            あなたの貴重なご意見をお聞かせいただき、感謝いたします。
          </p>

          {/* 回答内容の表示 */}
          {answer && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded">
              <p className="text-sm text-gray-600 mb-2">あなたの回答：</p>
              <p className="text-lg font-semibold text-gray-800">
                「{answer}」
              </p>
            </div>
          )}

          {/* シェア文言プレビュー */}
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <p className="text-sm text-gray-600 mb-2">シェア文言：</p>
            <p className="text-gray-800 font-medium whitespace-pre-wrap break-words">
              {shareText}
            </p>
          </div>

          {/* ボタングループ */}
          <div className="space-y-3">
            {/* Xシェアボタン */}
            <a href={xShareUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5" />
                Xでシェアする
              </Button>
            </a>

            {/* クリップボードコピーボタン */}
            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              className="w-full py-3 rounded-lg font-semibold"
            >
              {copied ? "✓ コピーしました" : "Instagram投稿用テキストをコピー"}
            </Button>
          </div>

          {/* 補足テキスト */}
          <p className="text-xs text-gray-500 text-center mt-6">
            このページは、Googleフォームの回答内容を反映したシェアボタンを提供しています。
          </p>
        </div>

        {/* フッター */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            ご質問やご不明な点がございましたら、
            <br />
            お気軽にお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
}

