// src/worker.js

// allowlist.txt（CSV）の URL
const ALLOWLIST_URL = 'https://fujigy.github.io/allowlist.txt';

// 不許可時に戻すフォーム
const FORM_URL = 'https://fujigy.github.io/fujigyentry2.html';

export default {
  async fetch(request, env, ctx) {
    // POST 以外はフォームに戻す
    if (request.method !== 'POST') {
      return Response.redirect(FORM_URL, 302);
    }

    // Content-Type チェック
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

    // email 正規化
    const email = emailRaw.trim().toLowerCase();

    // email バリデーション
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return Response.redirect(FORM_URL, 302);
    }

    // allowlist.txt を取得
    let allowlistText;
    try {
      const res = await fetch(ALLOWLIST_URL, { method: 'GET' });
      if (!res.ok) return Response.redirect(FORM_URL, 302);
      allowlistText = await res.text();
    } catch (e) {
      return Response.redirect(FORM_URL, 302);
    }

    // CSV をパース（email,url）
    const lines = allowlistText
      .split(/\r\n|\r|\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));

    const map = new Map();

    for (const line of lines) {
      const [emailCol, urlCol] = line.split(',');
      if (emailCol && urlCol) {
        map.set(emailCol.trim().toLowerCase(), urlCol.trim());
      }
    }

    // 行き先 URL を取得
    const redirectUrl = map.get(email);

    if (redirectUrl) {
      // 許可 → note の限定公開 URL へ
      return Response.redirect(redirectUrl, 302);
    } else {
      // 不許可 → フォームに戻す
      return Response.redirect(FORM_URL, 302);
    }
  }
};
