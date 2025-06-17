export const DEFAULT_RESULT_LIMIT = 10;
export const DEFAULT_SIDEBAR_WIDTH = 384; // 24rem = 384px
export const MIN_SIDEBAR_WIDTH = 300;
export const MAX_SIDEBAR_WIDTH_RATIO = 0.6; // 画面の60%

export const ANIMATION_DURATION = 300; // ms
export const DRAWER_WIDTH = 288; // 18rem = 288px

export const drawerItems = [
  { text: "アカウント", icon: "User", id: "account" },
  { text: "設定", icon: "Settings", id: "settings" },
  { text: "検索履歴", icon: "Clock", id: "history" },
  { text: "ブックマーク", icon: "Bookmark", id: "bookmarks" },
  { text: "論文ネットワーク", icon: "TrendingUp", id: "network" },
] as const;