// Offline "Ask Yug" engine. Runs in the browser with no network (GitHub Pages, offline, or
// when the Claude endpoint isn't configured). It never generates claims: every answer is
// assembled from profile.ts (the resume) and github.ts (README facts).
//
// Pipeline: follow-up resolution → honest "not stated" / "not on resume" checks →
// intent rules (with typo tolerance) → skill lookup with evidence → ranked fact retrieval.

import { education, experience, profile, projects, simulations, skills, strengths, RESUME_URL } from "../data/profile";
import { repos } from "../data/github";
import { buildFacts, Fact } from "../data/knowledge";

const allSkills = skills.flatMap((g) => g.items.map((item) => ({ item, group: g.group })));

// Technologies that are not on the resume. If a GitHub repo uses one, the bot says so.
const NOT_LISTED = [
  "java", "c++", "c#", "golang", "rust", "kotlin", "swift", "php", "ruby", "scala",
  "angular", "vue", "svelte", "django", "fastapi", "spring", "express", "nestjs", "graphql",
  "mongodb", "redis", "kafka", "kubernetes", "k8s", "terraform", "aws", "azure", "gcp",
  "tensorflow", "keras", "scikit", "pandas", "spark", "hadoop", "flutter", "react native",
  "expo", "vite", "react query", "tanstack", "framer motion", "android", "ios", "solidity",
  "blockchain", "unity", "tableau", "power bi", "jenkins", "langchain",
];

const UNSTATED: [RegExp, string][] = [
  [/\b(salary|ctc|compensation|pay|stipend|package)\b/, "His salary expectations"],
  [/\bnotice period\b/, "His notice period"],
  [/\b(age|how old|birthday|date of birth|dob)\b/, "His age"],
  [/\b(visa|sponsorship|work permit|citizenship)\b/, "His visa or work-authorisation status"],
  [/\b(joining date|start date|when can he (start|join))\b/, "His exact start date"],
  [/\b(reference|referee)s?\b/, "References"],
  [/\b(rank|semester grade|sgpa|marks)\b/, "Per-semester grades or rank"],
  [/\b(favou?rite|hobby|hobbies|married|girlfriend|wife|religion|caste|family|personal life)\b/, "Personal details like that"],
];

/* ---------------- text helpers ---------------- */

const STOP = new Set(
  "a an the is are was were be been do does did he his him yug jain what which who whom how why when where can could would should will to of in on at for with and or about tell me please you your it its this that there their they them have has had any some more much many i we our".split(" ")
);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#./' ]/g, " ").replace(/\s+/g, " ").trim();
const words = (s: string) => norm(s).split(" ").filter(Boolean);
const stem = (w: string) => w.replace(/'s$/, "").replace(/(ing|ed|es|s)$/, "").replace(/\.$/, "");
const esc = (s: string) => s.replace(/[.+#*?^$|()[\]\\]/g, "\\$&");
const phrase = (k: string) => new RegExp(`(^|[^a-z0-9])${esc(k)}([^a-z0-9]|$)`);

function lev(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** True if any keyword appears in the question, allowing small typos on longer words. */
function mentions(q: string, ...keys: string[]) {
  const toks = words(q);
  return keys.some((k) => {
    if (k.includes(" ") || k.length < 6) return phrase(k).test(q) || (k.includes(" ") && q.includes(k));
    if (phrase(k).test(q) || q.includes(k)) return true;
    const max = k.length >= 8 ? 2 : 1;
    return toks.some((t) => t.length >= 4 && lev(t, k, max) <= max);
  });
}

/* ---------------- skill evidence ---------------- */

/** Resume phrasing that proves a skill without naming it. */
const SYNONYMS: Record<string, string[]> = {
  "Code Review": ["reviewing teammates' code"],
  Transformers: ["transformer model"],
  "Hugging Face Spaces": ["hugging face space"],
};

function skillPatterns(item: string) {
  return item
    .toLowerCase()
    .split(/[()/,]| and /)
    .map((k) => k.trim())
    .filter((k) => k.length >= 2)
    .map(phrase);
}

/** Where a skill shows up: resume projects, the internship, and public GitHub repos. */
export function evidenceFor(item: string): string[] {
  const re = skillPatterns(item);
  const hit = (text: string) => re.some((r) => r.test(text.toLowerCase()));
  const viaSynonym = (texts: string[]) =>
    (SYNONYMS[item] ?? []).some((syn) => texts.some((t) => t.toLowerCase().includes(syn)));
  const out: string[] = [];
  for (const p of projects) {
    if (p.stack.some(hit) || p.points.some(hit) || viaSynonym(p.points)) out.push(`${p.title} (${p.subtitle})`);
  }
  for (const job of experience) {
    if (job.points.some(hit) || viaSynonym(job.points)) out.push(`${job.role} at ${job.org.split(",")[0]}`);
  }
  for (const r of repos) {
    if (r.name === "Urdufreetoolkit") continue; // already covered by the resume project
    if (r.stack.some(hit)) out.push(r.name === "Yug-Portfolio" ? "This portfolio (GitHub)" : `${r.title} (GitHub)`);
  }
  return out;
}

function findSkills(q: string) {
  return allSkills.filter(({ item }) => {
    const keys = item
      .toLowerCase()
      .split(/[()/,]| and /)
      .map((k) => k.trim())
      .filter((k) => k.length > 2);
    const firstWords = keys.map((k) => k.split(" ")[0]).filter((w) => w.length >= 6 && w !== keys[0]);
    const variants = [...keys, ...firstWords]
      .flatMap((k) => [k, k.replace(/\./g, ""), k.replace(/\s+/g, "")])
      .filter((k) => k.length > 2);
    return variants.some((k) => phrase(k).test(q));
  });
}

/* ---------------- retrieval ---------------- */

let FACTS: (Fact & { terms: Set<string> })[] | null = null;
let IDF: Map<string, number> | null = null;

function corpus() {
  if (!FACTS) {
    FACTS = buildFacts().map((f) => ({ ...f, terms: new Set(words(f.text).filter((w) => !STOP.has(w)).map(stem)) }));
    const df = new Map<string, number>();
    FACTS.forEach((f) => f.terms.forEach((t) => df.set(t, (df.get(t) ?? 0) + 1)));
    IDF = new Map([...df].map(([t, n]) => [t, Math.log(1 + FACTS!.length / n)]));
  }
  return { facts: FACTS, idf: IDF! };
}

/** Rank facts by IDF-weighted term overlap (with typo-tolerant matching for long words). */
export function retrieve(q: string, k = 3, topic?: string) {
  const { facts, idf } = corpus();
  const qTerms = words(q).filter((w) => !STOP.has(w)).map(stem);
  if (!qTerms.length) return [];
  const scored = facts
    .filter((f) => !topic || f.topic === topic)
    .map((f) => {
      let score = 0;
      for (const t of qTerms) {
        if (f.terms.has(t)) score += idf.get(t) ?? 1;
        else if (t.length >= 6) {
          for (const ft of f.terms) {
            if (Math.abs(ft.length - t.length) <= 1 && lev(ft, t, 1) <= 1) {
              score += (idf.get(ft) ?? 1) * 0.7;
              break;
            }
          }
        }
      }
      return { f, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

const sourceLabel = (src: string) => (src === "resume" ? "resume" : src);

function factsAnswer(hits: { f: Fact }[], intro: string) {
  const sources = Array.from(new Set(hits.map((h) => sourceLabel(h.f.source))));
  return `${intro}\n${hits.map((h) => `- ${h.f.text}`).join("\n")}\nSource: ${sources.join(", ")}.`;
}

/* ---------------- canned answers ---------------- */

const contactBlock = () =>
  `- Email: ${profile.email}\n- Phone / WhatsApp: ${profile.phone}\n- LinkedIn: ${profile.linkedin}\n- GitHub: ${profile.github}`;

function projectAnswer(slug: string, deep = false) {
  const p = projects.find((x) => x.slug === slug)!;
  const repo = repos.find((r) => r.live === p.live);
  if (deep && repo) {
    return `More on **${p.title}** (from its GitHub README):\n${repo.facts
      .slice(0, 7)
      .map((x) => `- ${x}`)
      .join("\n")}\nSource: ${repo.url}`;
  }
  if (deep) {
    return `More on **${p.title}**:\n${p.architecture.map((a) => `- ${a.layer}: ${a.detail}`).join("\n")}\n${p.challenges
      .map((c) => `- ${c.problem} ${c.solution}`)
      .join("\n")}`;
  }
  return `**${p.title}** — ${p.subtitle} (${p.category}).\n${p.summary}\n${p.points
    .slice(0, 3)
    .map((x) => `- ${x}`)
    .join("\n")}\nStack: ${p.stack.join(", ")}. Live at ${p.live}${p.repo ? `, source at ${p.repo}` : ""}.\nAsk "tell me more" for the architecture.`;
}

function repoAnswer(name: string, deep = false) {
  const r = repos.find((x) => x.name === name)!;
  const facts = deep
    ? r.facts
    : [...r.facts.slice(0, 3), ...r.facts.slice(3).filter((f) => f.startsWith("Problem solved"))];
  return `**${r.title}** — ${r.summary}\n${facts.map((x) => `- ${x}`).join("\n")}\nStack: ${r.stack.join(", ")}. Repo: ${r.url}${
    r.live ? `, live at ${r.live}` : ""
  }.\n${r.authorship}`;
}

/* ---------------- topic routing ---------------- */

type Topic =
  | { kind: "project"; slug: string }
  | { kind: "repo"; name: string }
  | { kind: "experience" | "education" | "contact" | "github" | "site" | "ai" | "frontend" | "backend" | "skills" };

function detectTopic(q: string): Topic | null {
  if (mentions(q, "urdu", "ocr", "transliteration", "transliterate", "devanagari", "nastaliq", "paddleocr", "easyocr", "cer/wer", "vowel"))
    return { kind: "project", slug: "urdu-toolkit" };
  if (mentions(q, "oasis", "real estate", "land sales", "tanzania")) return { kind: "project", slug: "oasis-real-estate" };
  if (mentions(q, "avenue", "preschool", "admissions")) return { kind: "project", slug: "avenue-preschool" };
  if (mentions(q, "stats.fm", "statsfm", "spotify", "stats fm", "heatmap", "8x", "hiring assignment", "assignment"))
    return { kind: "repo", name: "stats-fm-clone" };
  if (mentions(q, "foodhub", "food hub", "eatflow", "food ordering", "food delivery", "restaurant")) return { kind: "repo", name: "eatflow-portfolio" };
  if (mentions(q, "flying safari", "safari")) return { kind: "repo", name: "Flying-Safari" };
  if (mentions(q, "this site", "this website", "this portfolio", "terminal", "shortcut", "badge", "easter egg", "secret", "konami", "cyber runner", "mini game", "minigame", "offline mode"))
    return { kind: "site" };
  if (mentions(q, "github", "repos", "repositories", "repository", "open source", "other projects", "side projects", "what else has he built"))
    return { kind: "github" };
  if (mentions(q, "ai role", "ml role", "machine learning", "ai/ml", "ai ml", "artificial intelligence", "deep learning", "llm", "nlp"))
    return { kind: "ai" };
  if (mentions(q, "frontend", "front end", "front-end", "ui engineer", "framework", "frameworks", "web development", "web dev", "for web", "full stack", "full-stack", "fullstack"))
    return { kind: "frontend" };
  if (mentions(q, "backend", "back end", "back-end", "server side", "database")) return { kind: "backend" };
  if (mentions(q, "dotsyndicate", "internship", "intern", "experience", "current job", "current role", "work at", "works at", "where does he work", "work currently", "currently working", "company", "employer", "job"))
    return { kind: "experience" };
  if (mentions(q, "education", "college", "degree", "cgpa", "gpa", "university", "graduate", "graduation", "study", "studies", "simulation", "forage", "goldman", "accenture"))
    return { kind: "education" };
  if (mentions(q, "contact", "email", "reach", "phone", "whatsapp", "call him", "hire", "available", "availability", "interview", "relocate", "relocation", "remote", "location", "located", "based", "lives", "live in", "which city", "where is he", "where's he"))
    return { kind: "contact" };
  return null;
}

// Words that only name or gesture at a project; anything else in the question is "specific".
const GENERIC = new Set(
  "stats.fm work works tell know project projects site website app tool toolkit clone urdu oasis real estate avenue preschool stats fm statsfm spotify foodhub food hub eatflow flying safari explain describe detail details overview built build made make".split(" ")
);

/** For "how does he measure OCR accuracy?"-style questions: best facts within one topic. */
function specificFacts(q: string, topicKey: string) {
  const specific = words(q).filter((w) => !STOP.has(w) && !GENERIC.has(w) && !GENERIC.has(stem(w)));
  if (!specific.length) return null;
  const hits = retrieve(specific.join(" "), 3, topicKey);
  return hits.length && hits[0].score >= 1.5 ? hits : null;
}

function topicAnswer(t: Topic, q: string, deep: boolean): string {
  if (!deep && (t.kind === "project" || t.kind === "repo")) {
    const key = t.kind === "project" ? t.slug : t.name === "Urdufreetoolkit" ? "urdu-toolkit" : `repo:${t.name}`;
    const hits = specificFacts(q, key);
    if (hits) return factsAnswer(hits, "From the project's documentation:");
  }
  switch (t.kind) {
    case "project":
      return projectAnswer(t.slug, deep);
    case "repo":
      return repoAnswer(t.name, deep);
    case "experience": {
      const job = experience[0];
      return `Yug is a **${job.role}** at ${job.org} (${job.period}).\n${job.points
        .map((p) => `- ${p}`)
        .join("\n")}\nThere he shipped two live client sites: Oasis Real Estate (oasisrealestate.tz) and The Avenue Preschool (avenue.co.tz).`;
    }
    case "education":
      return `${education.degree} at ${education.school}: CGPA ${education.cgpa}, ${education.period.toLowerCase()}.\nJob simulations:\n${simulations
        .map((s) => `- ${s.title} — ${s.org}, ${s.year}`)
        .join("\n")}`;
    case "contact":
      if (mentions(q, "relocate", "relocation", "remote", "location", "located", "based", "lives", "live in", "which city", "where is he", "where's he", "shift")) {
        return `Yug is based in ${profile.location} and his resume says he's open to varied roles, locations and shifts. Reach him at ${profile.email}.`;
      }
      return `Yug's resume says he's open to varied roles, locations and shifts. Fastest ways to reach him:\n${contactBlock()}\nResume PDF: ${RESUME_URL}`;
    case "github":
      return `Public repos on github.com/${profile.githubHandle}:\n${repos
        .map((r) => `- **${r.title}** — ${r.summary.split(". ")[0]}. (${r.url})`)
        .join("\n")}\nAsk about any one by name.`;
    case "site": {
      const site = repos.find((r) => r.name === "Yug-Portfolio")!;
      return `About this site: ${site.summary}\n${site.facts.map((f) => `- ${f}`).join("\n")}`;
    }
    case "ai":
      return `For AI/ML roles, his strongest work is **Urdu Toolkit**:\n- A plugin-style registry runs PaddleOCR, EasyOCR, OpenAI, Gemini and other engines side by side, each with its own timeout and failure isolation, streaming results over SSE.\n- He trained a character-level Transformer (PyTorch) on Wiktionary, AI4Bharat Aksharantar and Google Dakshina — human-authored data only — with a 23k-word gold lexicon and beam-search reranking.\n- OCR accuracy is scored by CER/WER with a CI regression gate.\nLive: https://urdufreetoolkit-five.vercel.app`;
    case "frontend":
      return `Frontend: React, Next.js, TypeScript, Tailwind CSS, shadcn/ui, Three.js, GSAP.\n- Client sites at DotSyndicate with Next.js + React: Oasis Real Estate and The Avenue Preschool.\n- On GitHub: FoodHub (React, TypeScript, Vite, React Query, shadcn/ui) and a Stats.fm clone (Next.js 16, React 19, Supabase).\n- This portfolio: React, Three.js, GSAP.`;
    case "backend":
      return `Backend & data: Node.js, Flask, Supabase (PostgreSQL), Firebase / Firestore, MySQL, REST API design.\n- Firebase Authentication, Firestore and Storage at DotSyndicate.\n- A Flask backend in Urdu Toolkit that runs engines in parallel and streams results over Server-Sent Events.\n- Supabase auth + Postgres in his Stats.fm clone (GitHub).`;
    case "skills":
      return `Skills from his resume:\n${skills.map((g) => `- ${g.group}: ${g.items.join(", ")}`).join("\n")}`;
  }
}

/* ---------------- entry point ---------------- */

const FOLLOW_UP = /^(more|tell me more|go on|continue|elaborate|explain( more)?|details?|more details|what else|anything else|and\??|go deeper|deeper)\b/;

/**
 * Answer a question from the resume and GitHub facts only.
 * `previous` is the user's previous question, used to resolve follow-ups like "tell me more".
 */
export function answerLocally(question: string, previous?: string): string {
  const q = norm(question);
  if (!q) return "Ask me anything about Yug: his work, projects, skills or how to reach him.";

  // Follow-ups reuse the previous topic, with more depth.
  if (FOLLOW_UP.test(q) && q.split(" ").length <= 5) {
    const prevTopic = previous ? detectTopic(norm(previous)) : null;
    if (prevTopic) return topicAnswer(prevTopic, norm(previous!), true);
    if (previous) {
      const hits = retrieve(previous, 4);
      if (hits.length) return factsAnswer(hits.slice(1).length ? hits.slice(1) : hits, "More on that:");
    }
    return "Happy to go deeper. What would you like more on: his internship, a project, or his skills?";
  }

  if (/^(hi|hello|hey|yo|namaste|hii+|good (morning|evening|afternoon))\b/.test(q) && q.split(" ").length <= 4) {
    return "Hi! I'm Yug's portfolio assistant. Ask me about his internship at DotSyndicate, his projects, his skills, or how to get in touch.";
  }
  if (/^(thanks|thank you|thx|cool|great|nice|ok|okay)\b/.test(q) && q.split(" ").length <= 4) {
    return `Glad to help. If you'd like to talk to Yug directly: ${profile.email}.`;
  }

  for (const [re, what] of UNSTATED) {
    if (re.test(q)) return `${what} isn't stated on his resume or GitHub, so I won't guess. Ask him directly at ${profile.email}.`;
  }

  // Honest answer for technologies that aren't on the resume (GitHub may still show them).
  const matched = findSkills(q);
  const missing = NOT_LISTED.find((t) => phrase(t).test(q));
  if (missing && matched.every((m) => missing.includes(m.item.toLowerCase()))) {
    const name = missing.length <= 3 ? missing.toUpperCase() : missing.replace(/\b\w/g, (c) => c.toUpperCase());
    const inRepos = repos.filter((r) => r.stack.some((s) => phrase(missing).test(s.toLowerCase())));
    if (inRepos.length) {
      return `${name} isn't on his resume, but his public GitHub shows it: ${inRepos
        .map((r) => `${r.title} (${r.url})`)
        .join("; ")}.`;
    }
    return `${name} isn't on Yug's resume or his public GitHub, so I won't claim it. His closest experience is in ${skills
      .slice(2, 5)
      .map((g) => g.items.slice(0, 2).join(" and "))
      .join(", ")}, and his resume says he picks up new stacks quickly. Ask him at ${profile.email}.`;
  }

  if (mentions(q, "production", "real project", "used in", "hands on", "hands-on", "proof", "evidence", "shipped")) {
    const used = allSkills.map((s) => ({ ...s, ev: evidenceFor(s.item) })).filter((s) => s.ev.length);
    return `${used.length} of his ${allSkills.length} resume skills show up in shipped work:\n${used
      .slice(0, 16)
      .map((s) => `- **${s.item}**: ${s.ev.slice(0, 2).join("; ")}`)
      .join("\n")}`;
  }

  if (mentions(q, "strength", "soft skill", "why hire", "why should", "what makes him", "stand out", "unique")) {
    return `Why Yug:\n${strengths.map((s) => `- ${s}`).join("\n")}\nBacked by two client sites shipped under real deadlines and a self-trained Transformer model running as Urdu Toolkit's offline default.`;
  }

  const topic = detectTopic(q);
  // A specific skill question ("does he know Flask?") beats a broad topic like "backend".
  if (matched.length && (!topic || ["frontend", "backend", "ai", "skills", "experience"].includes(topic.kind))) {
    return matched
      .slice(0, 3)
      .map(({ item, group }) => {
        const ev = evidenceFor(item);
        return `**${item}** (${group}): yes.${ev.length ? ` Used in ${ev.join("; ")}.` : " It's listed in his resume skills."}`;
      })
      .join("\n");
  }
  if (topic) return topicAnswer(topic, q, false);

  if (mentions(q, "skill", "stack", "tech", "technology", "technologies", "language", "tool", "know")) {
    return topicAnswer({ kind: "skills" }, q, false);
  }
  if (mentions(q, "project", "built", "portfolio", "work sample", "made")) {
    return `Resume projects (all live):\n${projects
      .map((p) => `- **${p.title}** — ${p.subtitle}: ${p.live}`)
      .join("\n")}\nMore on GitHub: FoodHub, a Stats.fm clone and Flying Safari. Ask about any one.`;
  }
  if (mentions(q, "resume", "cv")) return `Download the resume here: ${RESUME_URL}`;
  if (mentions(q, "who is", "about him", "yourself", "summary", "introduce", "overview")) return profile.summary;

  // Last resort: ranked retrieval over every fact.
  const hits = retrieve(q, 3);
  if (hits.length && hits[0].score >= 2.5) return factsAnswer(hits, "Here's what I found:");

  return `I only know what's on Yug's resume and public GitHub, and that isn't covered. Try asking about his internship, projects or skills, or email him at ${profile.email}.`;
}
