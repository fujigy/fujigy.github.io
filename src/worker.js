// src/worker.js

const ALLOWLIST_URL = 'https://fujigy.github.io/allowlist.txt'; // 1行1メールアドレス
const NOTE_URL = 'https://note.com/your_note_slug';             // 限定公開URL
const FORM_URL = 'https://fujigy.github.io/fujigyentry2.html';  // 元フォームのURL

export default {
  async fetch(request, env, ctx) {
    // POST 以外はフォームに戻す
    if (request.method !== 'POST') {
      return Response.redirect(FORM_URL, 302);
    }

    // Content-Type チェック（フォーム送信のみ許可）
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.includes('application/x-www-form-urlencoded')) {
      return Response.redirect(FORM_URL, 302);
    }

    // フォームデータ取得
    const formData = await request.formData();
    const emailRaw = formData.get('email');

    if (typeof emailRaw !== 'string') {
      return Response.redirect(FORM_URL, 302);
    }

    // email 正規化（前後空白除去・小文字化）
    const email = emailRaw.trim().toLowerCase();

    // 簡易バリデーション（必要なら強めてもOK）
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return Response.redirect(FORM_URL, 302);
    }

    // allowlist.txt を取得
    let allowlistText;
    try {
      const res = await fetch(ALLOWLIST_URL, { method: 'GET' });
      if (!res.ok) {
        // 安全側に倒す
        return Response.redirect(FORM_URL, 302);
      }
      allowlistText = await res.text();
    } catch (e) {
      // ネットワークエラーなど → 安全側
      return Response.redirect(FORM_URL, 302);
    }

    // 許可リストを配列化（空行・空白を除去）
    const allowedEmails = allowlistText
      .split(/\r\n|\r|\n/)
      .map(line => line.trim().toLowerCase())
      .filter(line => line.length > 0);

    const isAllowed = allowedEmails.includes(email);

    if (isAllowed) {
      // 許可 → note の限定公開URLへ
      return Response.redirect(NOTE_URL, 302);
    } else {
      // 不許可 → フォームに戻す（中身はブラウザ側でクリアされる想定）
      return Response.redirect(FORM_URL, 302);
    }
  }
};
