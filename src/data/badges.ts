// Hidden developer badges. Unlocked by exploring the site; stored on this device only.

export const BADGES = [
  { id: "shell", emoji: "⌨️", name: "Shell Explorer", hint: "Open the terminal" },
  { id: "palette", emoji: "⚡", name: "Power User", hint: "Open the command palette" },
  { id: "chat", emoji: "💬", name: "Interviewer", hint: "Ask the assistant a question" },
  { id: "recruiter", emoji: "📋", name: "Fast Tracker", hint: "Open the recruiter view" },
  { id: "deep-diver", emoji: "🔬", name: "Deep Diver", hint: "Read all three case studies" },
  { id: "gamer", emoji: "🕹️", name: "Player One", hint: "Play Cyber Runner" },
  { id: "squasher", emoji: "🐛", name: "Bug Squasher", hint: "Score 500+ in Cyber Runner" },
  { id: "marathon", emoji: "⏱️", name: "Marathoner", hint: "Survive the full 60 seconds" },
  { id: "konami", emoji: "🎮", name: "Konami Master", hint: "↑ ↑ ↓ ↓ ← → ← → B A" },
  { id: "matrix", emoji: "🟩", name: "Matrix Walker", hint: "Type a certain movie into the terminal" },
  { id: "hire", emoji: "🤝", name: "Talent Scout", hint: "Run the one sudo command that works" },
  { id: "chaos", emoji: "🌪️", name: "Chaos Engineer", hint: "Shake the tech stack" },
  { id: "audio", emoji: "🔊", name: "Audiophile", hint: "Turn the sound on" },
  { id: "theme", emoji: "🎨", name: "Interior Designer", hint: "Change the site theme" },
  { id: "disco", emoji: "🪩", name: "Party Starter", hint: "Type a dance-floor word anywhere" },
  { id: "coffee", emoji: "☕", name: "Caffeinated", hint: "Developers run on something. Tell the terminal." },
  { id: "rm", emoji: "💣", name: "Reckless", hint: "Do the thing you should never do in a shell" },
  { id: "logo", emoji: "👆", name: "Persistent", hint: "Click the YJ logo repeatedly" },
  { id: "idle", emoji: "🧘", name: "Patient", hint: "Do nothing for a while" },
  { id: "console", emoji: "🧑‍💻", name: "Inspector", hint: "Peek behind the curtain (DevTools)" },
  { id: "offline", emoji: "📡", name: "Offline Survivor", hint: "Visit while offline" },
] as const;

export type BadgeId = (typeof BADGES)[number]["id"];
