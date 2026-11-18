// Everything the "Ask Yug" assistant knows, built from profile.ts (the resume) and github.ts
// (README facts). Used by the server-side Claude endpoint (api/chat.ts) as its grounding and
// by the offline engine in the browser (utils/localBot.ts) as its retrieval corpus.

import {
  education,
  experience,
  metrics,
  profile,
  projects,
  simulations,
  skills,
  strengths,
  RESUME_URL,
  SITE_URL,
} from "./profile.js";
import { GITHUB_SNAPSHOT, repos } from "./github.js";

export type Fact = { text: string; source: string; topic: string };

/** Atomic, citable facts. Each one is a sentence that can be shown on its own. */
export function buildFacts(): Fact[] {
  const f: Fact[] = [];
  const add = (topic: string, source: string, text: string) => f.push({ topic, source, text });

  add("profile", "resume", `${profile.name}: ${profile.tagline}. Based in ${profile.location}.`);
  add("profile", "resume", profile.summary);
  add("contact", "resume", `Email ${profile.email}; phone and WhatsApp ${profile.phone}; GitHub ${profile.github}; LinkedIn ${profile.linkedin}.`);
  add("contact", "resume", `Resume PDF: ${SITE_URL}${RESUME_URL}`);
  strengths.forEach((s) => add("strengths", "resume", `Strength: ${s}.`));

  for (const job of experience) {
    add("experience", "resume", `${job.role} at ${job.org}, ${job.period}.`);
    job.points.forEach((p) => add("experience", "resume", p));
  }

  for (const p of projects) {
    add(p.slug, "resume", `${p.title} — ${p.subtitle} (${p.category}). Live: ${p.live}${p.repo ? `. Source: ${p.repo}` : ""}.`);
    add(p.slug, "resume", `${p.title} stack: ${p.stack.join(", ")}.`);
    p.points.forEach((pt) => add(p.slug, "resume", pt));
    p.challenges.forEach((c) => add(p.slug, "resume", `${p.title}: ${c.problem} ${c.solution}`));
  }

  skills.forEach((g) => add("skills", "resume", `${g.group} skills: ${g.items.join(", ")}.`));
  add("education", "resume", `${education.degree}, ${education.school}. CGPA ${education.cgpa}. ${education.period}.`);
  simulations.forEach((s) => add("education", "resume", `Job simulation: ${s.title} — ${s.org}, ${s.year}.`));
  metrics.forEach((m) => add("numbers", "resume", `${m.value}: ${m.label}.`));

  for (const r of repos) {
    const topic = r.name === "Urdufreetoolkit" ? "urdu-toolkit" : `repo:${r.name}`;
    const src = `GitHub README (${r.name})`;
    add(topic, src, `${r.title}: ${r.summary} ${r.authorship}`);
    add(topic, src, `${r.title} uses ${r.stack.join(", ")}. Repo: ${r.url}${r.live ? `; live: ${r.live}` : ""}.`);
    r.facts.forEach((t) => add(topic, src, t));
  }
  return f;
}

/** The full grounding document for the AI model, grouped by source. */
export function buildDossier(): string {
  const lines: string[] = [];
  lines.push(`# ${profile.name}`);
  lines.push(`${profile.tagline}. Based in ${profile.location}.`);
  lines.push(`Email: ${profile.email} · Phone/WhatsApp: ${profile.phone}`);
  lines.push(`GitHub: ${profile.github} · LinkedIn: ${profile.linkedin}`);
  lines.push(`Resume PDF: ${SITE_URL}${RESUME_URL}`);
  lines.push("");
  lines.push("## Source 1: Resume");
  lines.push("### Summary");
  lines.push(profile.summary);
  lines.push("### Experience");
  for (const job of experience) {
    lines.push(`${job.role} — ${job.org} (${job.period})`);
    job.points.forEach((p) => lines.push(`- ${p}`));
  }
  lines.push("### Projects");
  for (const p of projects) {
    lines.push(`${p.title} — ${p.subtitle} (${p.category}). Live: ${p.live}${p.repo ? ` · Source: ${p.repo}` : ""}`);
    lines.push(`Stack: ${p.stack.join(", ")}`);
    p.points.forEach((pt) => lines.push(`- ${pt}`));
  }
  lines.push("### Technical skills");
  skills.forEach((g) => lines.push(`- ${g.group}: ${g.items.join(", ")}`));
  lines.push("### Education");
  lines.push(`${education.degree}, ${education.school}. CGPA ${education.cgpa}. ${education.period}.`);
  lines.push("### Job simulations");
  simulations.forEach((s) => lines.push(`- ${s.title} — ${s.org}, ${s.year}`));
  lines.push("### Strengths");
  strengths.forEach((s) => lines.push(`- ${s}`));
  lines.push("");
  lines.push(`## Source 2: Public GitHub READMEs (github.com/${profile.githubHandle}, snapshot ${GITHUB_SNAPSHOT})`);
  for (const r of repos) {
    lines.push(`### ${r.title} — ${r.url}${r.live ? ` (live: ${r.live})` : ""}`);
    lines.push(`Authorship: ${r.authorship}`);
    lines.push(r.summary);
    lines.push(`Stack: ${r.stack.join(", ")}`);
    r.facts.forEach((t) => lines.push(`- ${t}`));
  }
  lines.push("");
  lines.push("## Not stated anywhere (say you don't know and suggest emailing him)");
  lines.push("Salary or expected CTC, notice period, age, date of birth, visa status, exact joining date, references, grades per semester, class rank.");
  return lines.join("\n");
}

export const SUGGESTED_QUESTIONS = [
  "What does Yug do at DotSyndicate?",
  "How does the Urdu Toolkit work?",
  "Which skills has he used in production?",
  "What else is on his GitHub?",
  "Is he available, and how do I reach him?",
  "What's his strongest project for an AI role?",
];
