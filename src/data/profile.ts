// Single source of truth for portfolio content.
// Every fact here comes from public/resume/Yug_Jain_Resume.pdf — keep them in sync.

export const SITE_URL = "https://yug-portfolio-rosy.vercel.app";
export const RESUME_URL = "/resume/Yug_Jain_Resume.pdf";

export const profile = {
  name: "Yug Jain",
  firstName: "Yug",
  initials: "YJ",
  role: "Software Engineer",
  tagline: "Software Engineer | B.Tech Electronics & Computer Science, 2027",
  location: "Mumbai, India",
  email: "yugjaina93@gmail.com",
  phone: "+91 99871 57575",
  phoneRaw: "+919987157575",
  whatsapp: "https://wa.me/919987157575",
  github: "https://github.com/yugj-arch",
  githubHandle: "yugj-arch",
  linkedin: "https://www.linkedin.com/in/yug-jain-dev",
  linkedinHandle: "yug-jain-dev",
  summary:
    "Engineering student (B.Tech ECS, 2027) and Full-Stack Developer Intern at DotSyndicate with two live client websites shipped under real deadlines. Strong in programming, debugging and reading code written by others, with hands-on experience across the full lifecycle: design, development, testing, CI and deployment. Built an AI-powered OCR and transliteration platform with a plugin-based architecture and a self-trained Transformer model. Uses AI coding assistants responsibly, reviewing and testing every change.",
  shortBio:
    "Full-Stack Developer Intern at DotSyndicate and B.Tech Electronics & Computer Science student (2027). I ship client websites with Next.js and React, and I built an AI OCR and transliteration platform with a self-trained Transformer model.",
};

export const experience = [
  {
    role: "Full-Stack Developer Intern",
    org: "DotSyndicate, Mumbai",
    period: "Jun 2026 – Present",
    year: "2026",
    points: [
      "Develop and maintain client websites end to end with Next.js, React and Node.js, translating client requirements into working modules.",
      "Integrated Firebase Authentication, Firestore and Firebase Storage for secure login, real-time data sync and media delivery.",
      "Work on-site with the development team: Git-based version control, reviewing teammates' code, testing across devices and deploying to production.",
      "Communicate directly with project stakeholders to turn content and feedback into shipped changes; optimise images and responsiveness for fast mobile loading.",
    ],
  },
];

export const simulations = [
  {
    title: "Software Engineering Job Simulation",
    org: "Goldman Sachs (Forage)",
    year: "2024",
  },
  {
    title: "Developer & Technology Job Simulation",
    org: "Accenture (Forage)",
    year: "2024",
  },
];

export const education = {
  school: "Shah & Anchor Kutchhi Engineering College, Mumbai",
  degree: "B.Tech in Electronics & Computer Science",
  cgpa: "7.7 / 10",
  period: "Expected 2027",
};

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Languages",
    items: ["JavaScript", "TypeScript", "Python", "SQL", "HTML5", "CSS3"],
  },
  {
    group: "Core CS",
    items: [
      "Data Structures & Algorithms",
      "OOP",
      "Debugging",
      "Code Review",
      "Unit Testing (pytest)",
      "REST API Design",
    ],
  },
  {
    group: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS", "shadcn/ui", "Three.js", "GSAP"],
  },
  {
    group: "Backend & Data",
    items: [
      "Node.js",
      "Flask",
      "Supabase (PostgreSQL)",
      "Firebase / Firestore",
      "MySQL",
    ],
  },
  {
    group: "Cloud & DevOps",
    items: ["Git", "GitHub", "Docker", "CI", "Vercel", "Hugging Face Spaces", "ESLint"],
  },
  {
    group: "AI / ML",
    items: [
      "PyTorch",
      "Transformers",
      "OCR (PaddleOCR, EasyOCR)",
      "OpenAI and Gemini APIs",
      "AI coding assistants",
    ],
  },
  { group: "Tools", items: ["VS Code", "Figma"] },
];

export const strengths = [
  "Ownership of client deliverables",
  "Clear communication with stakeholders",
  "Fast learner across stacks",
  "Comfortable working independently and juggling parallel tasks",
  "Open to varied roles, locations and shifts",
];

/** Quick-glance numbers. Each one is stated in the resume. */
export const metrics = [
  { value: "3", label: "Projects live in production" },
  { value: "2", label: "Client websites shipped at DotSyndicate" },
  { value: "23k", label: "Word gold lexicon for the Transformer model" },
  { value: "7.7", label: "CGPA, B.Tech ECS (2027)" },
];

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  stack: string[];
  live: string;
  liveLabel: string;
  repo?: string;
  accent: string;
  /** Short text drawn inside the project preview card. */
  preview: { headline: string; lines: string[] };
  summary: string;
  points: string[];
  architecture: { layer: string; detail: string }[];
  challenges: { problem: string; solution: string }[];
  /** Real screenshots of the live site (WebP, 1425x900). The first one is the card cover. */
  shots?: { src: string; caption: string }[];
};

export const projects: Project[] = [
  {
    slug: "urdu-toolkit",
    title: "Urdu Toolkit",
    subtitle: "AI OCR & Transliteration Platform",
    category: "Personal project · AI / ML",
    stack: [
      "Python",
      "Flask",
      "PyTorch",
      "PaddleOCR",
      "EasyOCR",
      "OpenAI / Gemini APIs",
      "SSE",
      "pytest",
      "Docker",
      "Vercel",
    ],
    live: "https://urdufreetoolkit-five.vercel.app",
    liveLabel: "urdufreetoolkit-five.vercel.app",
    repo: "https://github.com/yugj-arch/Urdufreetoolkit",
    accent: "#5eead4",
    shots: [
      { src: "/images/projects/urdu-1.webp", caption: "Step 1: read Urdu from an image, choosing which OCR engines to run" },
      { src: "/images/projects/urdu-2.webp", caption: "Step 2: transliterate to Devanagari and Roman with the offline fine-tuned model" },
    ],
    preview: {
      headline: "اردو → उर्दू → Urdu",
      lines: ["OCR engines in parallel", "Self-trained Transformer", "Streamed over SSE"],
    },
    summary:
      "A web app that extracts Urdu text from images and transliterates it to Devanagari and Roman script, running multiple OCR and AI engines side by side for comparison.",
    points: [
      "Built a web app that extracts Urdu text from images and transliterates it to Devanagari and Roman script, running multiple OCR and AI engines side by side for comparison.",
      "Designed a plugin-style provider registry that discovers engines at runtime and runs them in parallel with per-engine timeouts and failure isolation, streaming results over Server-Sent Events.",
      "Trained a character-level Transformer model on open datasets (Wiktionary, AI4Bharat Aksharantar, Google Dakshina) with a 23k-word gold lexicon and beam-search reranking; ships as the offline default.",
      "Wrote pytest tests and a CER/WER evaluation harness with a CI regression gate; deployed to Vercel and a Docker-based Hugging Face Space.",
    ],
    architecture: [
      { layer: "Backend", detail: "Python + Flask, results streamed to the browser over Server-Sent Events" },
      { layer: "Engines", detail: "Plugin-style provider registry: PaddleOCR, EasyOCR, OpenAI and Gemini APIs" },
      { layer: "Model", detail: "Character-level Transformer (PyTorch), 23k-word gold lexicon, beam-search reranking" },
      { layer: "Quality", detail: "pytest suite and CER/WER evaluation harness with a CI regression gate" },
      { layer: "Deploy", detail: "Vercel and a Docker-based Hugging Face Space" },
    ],
    challenges: [
      {
        problem: "One slow or failing OCR engine could block every other result.",
        solution:
          "Engines run in parallel with per-engine timeouts and failure isolation; each result streams over SSE as soon as it is ready.",
      },
      {
        problem: "Adding a new engine should not mean rewiring the app.",
        solution: "A provider registry discovers engines at runtime, so each engine is a plugin.",
      },
      {
        problem: "Transliteration needs to work without paid API calls.",
        solution:
          "A self-trained character-level Transformer ships as the offline default, with a CER/WER gate in CI to catch accuracy regressions.",
      },
    ],
  },
  {
    slug: "oasis-real-estate",
    title: "Oasis Real Estate",
    subtitle: "Land Sales Website",
    category: "Client · DotSyndicate",
    stack: ["Next.js", "React", "Firebase Storage", "Responsive Design"],
    live: "https://oasisrealestate.tz",
    liveLabel: "oasisrealestate.tz",
    accent: "#fbbf24",
    shots: [
      { src: "/images/projects/oasis-1.webp", caption: "Hero: surveyed land across Dar es Salaam and the Coastal Region, with a View All Projects call to action" },
      { src: "/images/projects/oasis-2.webp", caption: "Developments carousel: plot sizes, per-sq-m cash prices and View Inventory buttons" },
      { src: "/images/projects/oasis-3.webp", caption: "Core services: site visits, land sales, investment advisory and title transfer" },
      { src: "/images/projects/oasis-4.webp", caption: "Client testimonials and a blogs & updates section" },
    ],
    preview: {
      headline: "5 developments · 7 pages",
      lines: ["Plot sizes & per-sq-m pricing", "Inventory views", "Book Site Visit · WhatsApp"],
    },
    summary:
      "A 7-page website for a Tanzanian land-sales company, built to turn visitors into sales enquiries.",
    points: [
      "Delivered a 7-page website for a Tanzanian land-sales company, including a showcase of five developments with plot sizes, per-sq-m pricing and inventory views.",
      "Built a lead-capture enquiry form plus Book Site Visit, WhatsApp, phone and Google Maps calls to action to convert visitors into sales enquiries.",
    ],
    architecture: [
      { layer: "Frontend", detail: "Next.js + React, responsive across phones, tablets and desktops" },
      { layer: "Media", detail: "Firebase Storage for development imagery" },
      { layer: "Conversion", detail: "Enquiry form, Book Site Visit, WhatsApp, phone and Google Maps calls to action" },
    ],
    challenges: [
      {
        problem: "Buyers compare plots across five developments.",
        solution: "Each development shows plot sizes, per-sq-m pricing and inventory in one place.",
      },
      {
        problem: "Visitors reach out on different channels.",
        solution: "Every page offers the enquiry form, WhatsApp, phone and Google Maps, so no lead is lost.",
      },
    ],
  },
  {
    slug: "avenue-preschool",
    title: "The Avenue Preschool",
    subtitle: "School Website",
    category: "Client · DotSyndicate",
    stack: ["Next.js", "React", "Responsive Design", "Image Optimisation"],
    live: "https://avenue.co.tz",
    liveLabel: "avenue.co.tz",
    accent: "#f472b6",
    shots: [
      { src: "/images/projects/avenue-1.webp", caption: "Hero: side navigation with Book A Visit and Enquire Now always in reach" },
      { src: "/images/projects/avenue-2.webp", caption: "Nursery of the Year 2026 award and the school's philosophy" },
      { src: "/images/projects/avenue-3.webp", caption: "Curriculum journey: Playgroup to Pre-Reception, built on the British EYFS framework" },
      { src: "/images/projects/avenue-4.webp", caption: "Admissions enquiry form with enquiry-type selector, plus contact footer" },
    ],
    preview: {
      headline: "Admissions, made easy",
      lines: ["7 enquiry types", "Book A Visit · Enquire Now", "Mobile WebP images"],
    },
    summary:
      "A multi-page school website with an admissions enquiry flow, tuned for fast loading on phones.",
    points: [
      "Delivered a multi-page school website with an admissions enquiry form supporting seven enquiry types and Book A Visit / Enquire Now flows.",
      "Served separate mobile WebP images to cut page weight and speed up loading on phones.",
    ],
    architecture: [
      { layer: "Frontend", detail: "Next.js + React, multi-page, responsive" },
      { layer: "Admissions", detail: "Enquiry form with seven enquiry types, Book A Visit and Enquire Now flows" },
      { layer: "Performance", detail: "Separate mobile WebP images to cut page weight on phones" },
    ],
    challenges: [
      {
        problem: "Parents mostly browse on phones, often on slow connections.",
        solution: "Separate mobile WebP images cut page weight and speed up loading.",
      },
      {
        problem: "Admissions questions vary a lot.",
        solution: "One form handles seven enquiry types, so each enquiry reaches the school with context.",
      },
    ],
  },
  {
    slug: "euphoric-events",
    title: "Euphoric Events",
    subtitle: "Luxury Event Planning Website",
    category: "Client project · Events",
    stack: ["Responsive Design", "Image Galleries", "WhatsApp Integration"],
    live: "https://euphoric-events-website.vercel.app",
    liveLabel: "euphoric-events-website.vercel.app",
    accent: "#f472b6",
    shots: [
      { src: "/images/projects/euphoric-1.webp", caption: "Hero: full-bleed celebration photography with a clear call to action" },
      { src: "/images/projects/euphoric-2.webp", caption: "Services: customised experiences for every occasion" },
      { src: "/images/projects/euphoric-3.webp", caption: "Memories: arch-framed cards for each celebration" },
      { src: "/images/projects/euphoric-4.webp", caption: "Featured celebrations: a collage gallery of real events" },
    ],
    preview: {
      headline: "Crafting celebrations that last forever",
      lines: ["Services & featured celebrations", "Memories gallery", "Let's Talk · WhatsApp"],
    },
    summary:
      "A photography-led website for a luxury event-planning company, built to showcase real celebrations and turn visitors into enquiries.",
    points: [
      "Built a multi-section site covering the founder's story, services, memories and featured celebrations, with a Let's Talk contact flow.",
      "Designed image-rich galleries (arch-framed memory cards and a collage of featured events) that stay readable on phones and desktops.",
      "Added a persistent WhatsApp button so visitors can reach the planner from any section.",
    ],
    architecture: [
      { layer: "Frontend", detail: "Responsive multi-section single-page site, deployed on Vercel" },
      { layer: "Content", detail: "Founder story, services, memories gallery and featured celebrations" },
      { layer: "Conversion", detail: "Let's Talk and Let's Connect calls to action plus a floating WhatsApp button" },
    ],
    challenges: [
      {
        problem: "Event planning is sold on emotion, and photos carry it.",
        solution: "Galleries lead each section, with a warm burgundy palette and serif headings that keep the focus on the imagery.",
      },
      {
        problem: "Enquiries come through different channels.",
        solution: "A floating WhatsApp button and repeated Let's Talk buttons keep contact one tap away.",
      },
    ],
  },
];
