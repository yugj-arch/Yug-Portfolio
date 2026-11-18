// Accuracy eval for the offline "Ask Yug" engine. Run: npm run eval:bot
// Each case lists text the answer must contain and text it must never contain
// (fabrications we never want: skills or facts that aren't in the resume / GitHub READMEs).

import { answerLocally } from "../src/utils/localBot";

type Case = { q: string; prev?: string; must: string[]; never?: string[] };

const NEVER_INVENT = ["**java**", "java (languages)", "**kubernetes**", "**aws**", "**angular**", "salary is", "years of experience"];

const cases: Case[] = [
  // Experience
  { q: "What does Yug do at DotSyndicate?", must: ["Full-Stack Developer Intern", "Jun 2026", "Firebase"] },
  { q: "where does he work currently", must: ["DotSyndicate"] },
  { q: "Tell me about his internship", must: ["DotSyndicate", "Next.js"] },
  { q: "what did he do at dotsyndicat", must: ["DotSyndicate"] }, // typo

  // Resume projects
  { q: "How does the Urdu Toolkit work?", must: ["Urdu Toolkit", "Devanagari", "Server-Sent Events"] },
  { q: "tell me more", prev: "How does the Urdu Toolkit work?", must: ["README", "registry"] },
  { q: "what about oasis real estate", must: ["Oasis Real Estate", "7-page", "Tanzanian"] },
  { q: "avenue preschool site?", must: ["Avenue Preschool", "seven enquiry types", "WebP"] },
  { q: "What data was the transliteration model trained on?", must: ["Aksharantar", "Dakshina"] },
  { q: "how does he measure OCR accuracy", must: ["CER/WER"] },
  { q: "What are the limitations of the urdu tool?", must: ["vowel"] },
  { q: "how big is the gold lexicon", must: ["23k"] },

  // GitHub
  { q: "What else is on his GitHub?", must: ["FoodHub", "Stats.fm", "Flying Safari"] },
  { q: "Tell me about the stats.fm clone", must: ["Spotify", "Supabase", "mock data"] },
  { q: "foodhub project?", must: ["React Context", "TanStack"] },
  { q: "spotfy project", must: ["Spotify"] }, // typo

  // Skills with evidence
  { q: "Does he know Python?", must: ["Python", "yes", "Urdu Toolkit"] },
  { q: "Firebase?", must: ["Firebase", "DotSyndicate"] },
  { q: "Can he use Supabase?", must: ["Supabase", "Stats.fm"] },
  { q: "Does he know Flask?", must: ["Flask", "yes"] },
  { q: "Which skills has he used in production?", must: ["shipped work", "React"] },
  { q: "tailwind experience?", must: ["Tailwind", "yes"] },

  // Honest "no"
  { q: "Does he know Java?", must: ["isn't on"], never: ["Java (", "Java: yes"] },
  { q: "kubernetes experience?", must: ["isn't on"] },
  { q: "Has he used AWS?", must: ["isn't on"] },
  { q: "does he know react native", must: ["isn't on his resume", "Flying Safari"] },
  { q: "What is his expected salary?", must: ["isn't stated"] },
  { q: "what's his notice period", must: ["isn't stated"] },
  { q: "how old is he", must: ["isn't stated"] },

  // Education / contact / role fit
  { q: "tell me about his education", must: ["7.7", "2027", "Shah & Anchor Kutchhi"] },
  { q: "what's his CGPA", must: ["7.7"] },
  { q: "goldman sachs?", must: ["Goldman Sachs", "2024"] },
  { q: "Is he available, and how do I reach him?", must: ["yugjaina93@gmail.com", "open to varied roles"] },
  { q: "can he relocate", must: ["open to varied roles, locations and shifts"] },
  { q: "What's his strongest project for an AI role?", must: ["Urdu Toolkit", "Transformer"] },
  { q: "is he good for a frontend role", must: ["React", "Next.js"] },
  { q: "backend experience", must: ["Flask", "Firebase"] },
  { q: "why should we hire him", must: ["Ownership of client deliverables"] },

  // Site
  { q: "how do I open the terminal", must: ["Ctrl"] },
  { q: "are there any easter eggs on this site", must: ["badges"] },

  // Added from a held-out check (generalisation gaps found and fixed)
  { q: "What frameworks does he use for web?", must: ["Next.js", "React"] },
  { q: "Where is he located?", must: ["Mumbai"] },
  { q: "What is his favourite food?", must: ["isn't stated"], never: ["FoodHub"] },

  // Chit-chat / unknown
  { q: "hi", must: ["Hi!"] },
  { q: "what's the weather in Paris", must: ["isn't covered"] },
];

let pass = 0;
const failures: string[] = [];
for (const c of cases) {
  const a = answerLocally(c.q, c.prev);
  const low = a.toLowerCase();
  const missing = c.must.filter((m) => !low.includes(m.toLowerCase()));
  const bad = [...(c.never ?? []), ...NEVER_INVENT].filter((n) => low.includes(n.toLowerCase()));
  if (!missing.length && !bad.length) pass++;
  else
    failures.push(
      `✗ ${c.prev ? `[after "${c.prev}"] ` : ""}${c.q}\n   missing: ${JSON.stringify(missing)} forbidden: ${JSON.stringify(bad)}\n   got: ${a.slice(0, 220).replace(/\n/g, " | ")}`
    );
}

console.log(failures.join("\n\n"));
console.log(`\n${pass}/${cases.length} passed (${Math.round((pass / cases.length) * 100)}%)`);
process.exit(failures.length ? 1 : 0);
