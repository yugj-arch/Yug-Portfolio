// Facts from Yug's public GitHub repositories (github.com/yugj-arch), taken from each
// repo's README and the GitHub API. Snapshot date below; the site also fetches live counts.
// Only what the READMEs say is recorded here: no inferred clients, users or metrics.

export const GITHUB_SNAPSHOT = "2026-11-18";

export type Repo = {
  name: string;
  title: string;
  url: string;
  live?: string;
  /** How the README states authorship, quoted or paraphrased closely. */
  authorship: string;
  summary: string;
  stack: string[];
  facts: string[];
};

export const repos: Repo[] = [
  {
    name: "Urdufreetoolkit",
    title: "Urdu Toolkit",
    url: "https://github.com/yugj-arch/Urdufreetoolkit",
    live: "https://urdufreetoolkit-five.vercel.app",
    authorship: "Yug's project (on his resume).",
    summary:
      "Pulls Urdu text out of images, transliterates it to Devanagari and Roman, and runs several OCR / transliteration engines side by side for comparison. Free and offline first; paid APIs are optional extras.",
    stack: ["Python", "Flask", "PyTorch", "PaddleOCR", "EasyOCR", "OpenAI", "Anthropic", "Google Gemini", "Google Cloud Vision", "SSE", "pytest", "Docker", "Vercel", "Hugging Face Spaces"],
    facts: [
      "Every step is a set of small provider modules (providers/<capability>/). A registry discovers providers at runtime and reports which can run right now (installed? API key set?).",
      "A parallel runner executes the engines the user ticks, isolating any that fail or time out into their own result column; the OCR endpoint streams results over Server-Sent Events so columns fill in as each engine finishes.",
      "The picker shows a curated shortlist (at most four engines per step) with a rough price badge on each; offline engines are free.",
      "OCR engines shown: OpenAI GPT vision, Google Cloud Vision (API), PaddleOCR and EasyOCR (offline). More ship but are hidden by default: Gemini vision, Claude vision, Surya, RapidOCR, docTR, TrOCR, Tesseract.",
      "Offline OCR pipeline: preprocess (grayscale, upscale, denoise, CLAHE, deskew, binarize) → detect + recognize → right-to-left reading-order reconstruction → Urdu text normalization → rule-engine transliteration fill.",
      "Accuracy is measured with an eval harness that scores every OCR engine by CER/WER against cached GPT 'silver reference' transcriptions, with a CI regression gate against a baseline.",
      "Default transliteration engine: a small character-level Transformer trained only on free, human-authored data (Wiktionary Urdu + Hindi via kaikki.org, AI4Bharat Aksharantar, Google Dakshina). No LLM output was used as a label.",
      "Per word it goes curated dictionary → 23k-word gold lexicon → model with beam search, reranked by how about 47k words are actually romanised by people. Roman (plain 'kitaab' and Rekhta-style 'kitāb') and Devanagari come from one reading, so they never disagree.",
      "The trained weights and tables ship in the repo (about 16 MB).",
      "Modes: single image (compare columns, pick the best, then transliterate), paste text (skip OCR), and batch (up to 30 images locally, 4 on the Vercel deployment) with results streaming into a table and a CSV download.",
      "API keys are pasted in a Settings panel, written to a git-ignored .env, and only key names are ever sent back to the browser. On Vercel the panel is read-only.",
      "Deployments: Vercel (cloud engines only) and a Docker-based Hugging Face Space (all engines, including PaddleOCR and EasyOCR).",
      "Tests use pytest, with heavy providers gated behind RUN_HEAVY=1. Optional OCR fine-tuning tooling (synthetic Nastaliq/Naskh renderer, dataset converters) and a GPU runbook are included.",
      "Honest limitations listed in the README: Urdu script omits short vowels, so vowel restoration is a guess; the model reads one word at a time, so an unwritten izafat or some homographs can come out wrong; offline engines are heavy to install (multiple GB on first run).",
    ],
  },
  {
    name: "stats-fm-clone",
    title: "Stats.fm clone (hiring assignment)",
    url: "https://github.com/yugj-arch/stats-fm-clone",
    authorship: "Built by Yug as a hiring assignment; the README's 'Assignment Reflection' is written in his own words.",
    summary:
      "A clone of Stats.fm for Spotify built on an '8x' hiring starter template (Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Supabase).",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Supabase (PostgreSQL)", "Supabase Auth", "framer-motion", "html2canvas"],
    facts: [
      "Connects to Spotify via Supabase OAuth and shows top artists and top tracks by period (4 weeks, 6 months, all time).",
      "An interactive listening heatmap built from recently played tracks, mapped over a 7-day grid (Spotify's recently-played endpoint is limited to 50 tracks).",
      "A 'Music Personality' card analysing top genres and audio attributes (positivity, energy, danceability), with a shareable image export using html2canvas.",
      "Dark glassmorphic UI with staggered framer-motion animations.",
      "Problem solved: reviewers had no Spotify API keys, so he built a mock data layer that switches on automatically when valid Spotify tokens are absent, keeping the app fully reviewable.",
      "What he'd improve with more time (from his reflection): full history import from a Spotify data export ZIP, caching Spotify calls (Redis or React Query), and better html2canvas export aspect ratios.",
    ],
  },
  {
    name: "eatflow-portfolio",
    title: "FoodHub — food ordering web app",
    url: "https://github.com/yugj-arch/eatflow-portfolio",
    live: "https://eatflow-portfolio.vercel.app",
    authorship: "README footer: 'Built by Yug Jain'.",
    summary:
      "A responsive, multi-page food-ordering front end: restaurant browsing, cart, checkout and order tracking.",
    stack: ["React", "TypeScript", "Vite", "React Router", "TanStack React Query", "React Context", "shadcn/ui", "Tailwind CSS", "Sonner"],
    facts: [
      "Restaurant listings with dynamic detail pages (/restaurant/:id).",
      "Global cart state with React Context: add, remove and update quantities.",
      "Checkout page, track-order page, and a login / signup UI.",
      "Mobile-first responsive layout and toast notifications (Sonner).",
    ],
  },
  {
    name: "Flying-Safari",
    title: "Flying Safari website",
    url: "https://github.com/yugj-arch/Flying-Safari",
    live: "https://flying-safari-wine.vercel.app",
    authorship: "Public repo on Yug's GitHub; the README doesn't say who it was built for.",
    summary: "A safari booking and exploration website built with React Native for Web and Expo, deployed on Vercel.",
    stack: ["React", "React Native (Web)", "Expo", "TypeScript", "Vercel"],
    facts: ["Configured for automatic Vercel deploys on every push to main."],
  },
  {
    name: "Yug-Portfolio",
    title: "This portfolio",
    url: "https://github.com/yugj-arch/Yug-Portfolio",
    live: "https://yug-portfolio-rosy.vercel.app",
    authorship: "Yug's portfolio site (this website).",
    summary:
      "React + TypeScript + Vite site with a Three.js character scene, a particle galaxy, a Rapier physics skills pit, GSAP scrolling, a recruiter one-pager, a developer terminal, a command palette, a mini-game, offline support and this AI assistant.",
    stack: [
      "React",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Vite",
      "Three.js",
      "React Three Fiber",
      "Rapier",
      "GSAP",
      "Claude API",
      "Service Worker",
      "ESLint",
      "Git",
      "GitHub",
      "Vercel",
    ],
    facts: [
      "Shortcuts: Ctrl/Cmd + K opens the command palette; Ctrl + ` opens the terminal (try `help`, `projects`, `sudo hire yug`).",
      "Recruiter mode (button in the header, or ?mode=recruiter) shows a fast, printable one-page summary with resume download.",
      "Cyber Runner is a 60-second mini-game that also works offline; there are 14 hidden badges to find (Trophy case in the dock).",
      "A service worker lets the whole site load offline after the first visit.",
    ],
  },
];
