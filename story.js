// Timeline: single source of truth for camera, printing, narration and sound cues
export const DUR = 89.0;
export const q8 = t => Math.floor(t * 8) / 8;
export const q12 = t => Math.floor(t * 12) / 12;
export const NS = 7;                      // sheets: 0 桶狭間 | 1 長篠 | 2 本能寺 | 3 秀吉 | 4 関ヶ原 | 5 大坂 | 6 泰平
export const GAP = 260, SW = 1920 + GAP;
export const SLOT = i => (NS - 1 - i) * SW;          // first sheet rightmost, the camera reads right → left
export const VO = { L1: 3.0, L2: 14.5, L3: 27.0, L4: 41.5, L5: 53.5, L6: 63.5, L7: 74.0, L8: 79.8 };
export const T = {
  print1: [0.4, 1.1, 1.8, 2.4],
  pan01: [12.6, 13.5],
  pan12: [25.0, 25.9],
  fireStart: 27.2, hang: [33.0, 34.4], flare: [34.4, 35.8], wash3: [35.4, 36.4],
  ma: [36.4, 38.7],
  print4: [38.8, 39.3, 39.8, 40.3],
  pan34: [51.8, 52.7],
  pan45: [61.4, 62.3],
  pan56: [72.0, 72.9],
  v7: 72.9, pull: [80.4, 83.4], washEnd: [84.2, 85.6], seal: 86.4,
  cart: { v1: [8.8, 9.3], v2: [20.0, 20.5], v3: [31.0, 31.5], v4: [47.5, 48.0], v5: [58.0, 58.5], v6: [68.5, 69.0], v7: [77.0, 77.5] },
};
export const REVEAL_DUR = 0.34;
