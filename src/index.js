// src/index.js

// allowlist.txt（CSV）の URL
const ALLOWLIST_URL = "https://fujigy.github.io/allowlist.txt";

// target → URL のキー名
// allowlist.txt の 2 列目に書く URL は「target ごとに 1 つ」
const TARGET_KEYS = {
  resume: "resume",
  career: "career",
  training: "training",
  work: "work",
};

// 不許可時に戻すフォーム
const FORM_URL = "https://fujigy.github.io/fujigyentry2.html";

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return Response.redirect(FORM_URL, 302);
    }

    const contentType = request.headers.get("Content-Type") || "";
    if (!contentType.includes("application/x-www-form-urlencoded")) {
      return Response.redirect(FORM_URL, 302);
    }

    const formData = await request.formData();
    const emailRaw = formData.get("email");
    const targetRaw = formData.get("target");

    if (typeof emailRaw !== "string" || typeof targetRaw !== "string") {
      return Response.redirect(FORM_URL, 302);
    }

    const email = emailRaw.trim().toLowerCase();
    const target = targetRaw.trim().toLowerCase();

    // target が不正ならフォームに戻す
    if (!TARGET_KEYS[target]) {
      return Response.redirect(FORM_URL, 302);
    }

    // email バリデーション
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return Response.redirect(FORM_URL, 302);
    }

    // allowlist.txt を取得
    let allowlistText;
    try {
      const res = await fetch(ALLOWLIST_URL);
      if (!res.ok) return Response.redirect(FORM_URL, 302);
      allowlistText = await res.text();
    } catch {
      return Response.redirect(FORM_URL, 302);
    }

    // CSV パース（email,target,url）
    const lines = allowlistText
      .split(/\r\n|\r|\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"));

    // email-target → url のマップ
    const map = new Map();

    for (const line of lines) {
      const [emailCol, targetCol, urlCol] = line.split(",");
      if (emailCol && targetCol && urlCol) {
        const key = `${emailCol.trim().toLowerCase()}::${targetCol.trim().toLowerCase()}`;
        map.set(key, urlCol.trim());
      }
    }

    const lookupKey = `${email}::${target}`;
    const redirectUrl = map.get(lookupKey);

    if (redirectUrl) {
      return Response.redirect(redirectUrl, 302);
    } else {
      return Response.redirect(FORM_URL, 302);
    }
  },
};
