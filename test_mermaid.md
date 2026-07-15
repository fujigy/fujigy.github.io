flowchart LR
  subgraph ビジネスレーン
    A[入口] --> B[HUBページ]
    B --> C[プロフィール]
    C --> D[問い合わせフォーム]
  end

  subgraph 共通モジュール
    E[note]
    F[proff 履歴書・職務経歴書]
    G[PDF出力]
    H[Web3Forms メール送信]
    I[GitHub Pages]
    J[Canva あゆみ制作]
  end

  subgraph プライベートレーン
    K[HUBページ]
    L[壁打ちコンテンツ]
    M[あゆみページ]
  end

  D --> H
  H --> G
  F --> G
