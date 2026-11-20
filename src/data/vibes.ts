// Copy for the playful layer. Kept in one place so the tone is easy to tweak.

export const BURSTS: Record<string, string[]> = {
  teal: ["✨", "🌊", "🫧", "💫"],
  amber: ["☕", "🍂", "🌅", "✨"],
  rose: ["🌸", "💖", "🍓", "✨"],
  violet: ["🔮", "🌙", "💜", "✨"],
  ice: ["❄️", "🫧", "💎", "✨"],
};

const MOODS: Record<"night" | "morning" | "day" | "evening", string[]> = {
  night: ["🌙 up late, coding quietly", "🦉 night-owl mode", "☕ one more commit…"],
  morning: ["☀️ fresh coffee, fresh ideas", "🥐 morning build in progress", "🌤️ easing into the day"],
  day: ["🎧 in the zone", "🛠️ shipping something fun", "🍉 snack break, then back to it"],
  evening: ["🌆 golden hour, golden code", "🍜 dinner then debugging", "🎵 lo-fi and a good diff"],
};

export function mood(date = new Date()) {
  const h = date.getHours();
  const slot = h < 5 ? "night" : h < 11 ? "morning" : h < 17 ? "day" : h < 22 ? "evening" : "night";
  const list = MOODS[slot];
  return list[(date.getDate() + h) % list.length];
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "🌙 Late one! Make yourself comfy.";
  if (h < 12) return "☀️ Good morning! Grab a coffee and look around.";
  if (h < 18) return "👋 Hey there! No rush, take your time.";
  return "🌆 Good evening! Pull up a chair.";
}

export const TICKER = [
  "build things",
  "drink water",
  "ship it",
  "be kind",
  "take breaks",
  "stay curious",
  "touch grass",
  "write tests (sometimes)",
  "have fun",
];

export const AWAY_TITLE = "Come back 🥺 | Yug Jain";
