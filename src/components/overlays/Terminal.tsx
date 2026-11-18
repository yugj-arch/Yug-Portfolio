import { FormEvent, KeyboardEvent, ReactNode, useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import {
  education,
  experience,
  profile,
  projects,
  RESUME_URL,
  simulations,
  skills,
} from "../../data/profile";
import { useExperience } from "../../context/ExperienceProvider";
import { useDialog } from "../../hooks/useDialog";
import { fetchGitHubStats } from "../../utils/github";

type Line = { kind: "in" | "out" | "err"; body: ReactNode };

const COMMANDS: Record<string, string> = {
  help: "List commands",
  bio: "Who is Yug?",
  experience: "Work experience",
  projects: "Projects (try: project 1)",
  skills: "Technical skills",
  education: "Education and job simulations",
  contact: "Email, phone and socials",
  resume: "Download the resume PDF",
  recruiter: "Open the fast recruiter view",
  "sudo hire yug": "You know you want to",
  badges: "Your hidden badges",
  ask: "Open the AI assistant",
  perf: "Live Web Vitals + how this site is built",
  github: "Live GitHub stats",
  matrix: "Enter the matrix",
  play: "Launch the arcade",
  sound: "Toggle UI sound",
  god: "Toggle god mode (or use the Konami code)",
  clear: "Clear the screen",
  exit: "Close the terminal",
};

const link = (href: string, text = href) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {text}
  </a>
);

const WELCOME: Line[] = [
  { kind: "out", body: <span className="term-accent">Yug Jain — interactive résumé shell v1.0</span> },
  { kind: "out", body: "Type `help` to list commands. Tab completes, ↑/↓ recall history, Esc closes." },
];

const Terminal = () => {
  const { close, open, openProject, runMatrix, confetti, sfx, toggleMuted, muted, godMode, setGodMode, unlock, setChatOpen } =
    useExperience();
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useDialog(panelRef, inputRef);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const out = (...body: ReactNode[]): Line[] => body.map((b) => ({ kind: "out", body: b }));

  const run = (raw: string): Line[] | "clear" => {
    const input = raw.trim().replace(/\s+/g, " ");
    const cmd = input.toLowerCase();
    if (!cmd) return [];

    if (cmd === "help") {
      return out(
        ...Object.entries(COMMANDS).map(([name, desc]) => (
          <>
            <span className="term-accent">{name.padEnd(15, " ")}</span>
            {desc}
          </>
        ))
      );
    }
    if (cmd === "bio" || cmd === "about" || cmd === "whoami") {
      return out(`${profile.name} — ${profile.tagline}`, `📍 ${profile.location}`, "", profile.summary);
    }
    if (cmd === "experience" || cmd === "work") {
      return experience.flatMap((job) =>
        out(
          <span className="term-accent">
            {job.role} — {job.org} ({job.period})
          </span>,
          ...job.points.map((p) => `  • ${p}`)
        )
      );
    }
    if (cmd === "projects" || cmd === "ls projects" || cmd === "ls") {
      return out(
        ...projects.map((p, i) => (
          <>
            <span className="term-accent">[{i + 1}]</span> {p.title} — {p.subtitle} · {link(p.live, p.liveLabel)}
          </>
        )),
        "",
        "Type `project <number>` for the deep dive."
      );
    }
    const projectMatch = cmd.match(/^(?:project|open|cat) (\d+)$/);
    if (projectMatch) {
      const p = projects[Number(projectMatch[1]) - 1];
      if (!p) return [{ kind: "err", body: `No project #${projectMatch[1]}. Try 1–${projects.length}.` }];
      window.setTimeout(() => openProject(p.slug), 250);
      return out(`Opening ${p.title}…`);
    }
    if (cmd === "skills" || cmd === "stack") {
      return out(
        ...skills.map((g) => (
          <>
            <span className="term-accent">{g.group.padEnd(16, " ")}</span>
            {g.items.join(", ")}
          </>
        ))
      );
    }
    if (cmd === "education" || cmd === "edu") {
      return out(
        <span className="term-accent">{education.school}</span>,
        `  ${education.degree} · CGPA ${education.cgpa} · ${education.period}`,
        "",
        <span className="term-accent">Job simulations</span>,
        ...simulations.map((s) => `  • ${s.title} — ${s.org}, ${s.year}`)
      );
    }
    if (cmd === "contact") {
      return out(
        <>email     {link(`mailto:${profile.email}`, profile.email)}</>,
        <>phone     {link(`tel:${profile.phoneRaw}`, profile.phone)}</>,
        <>whatsapp  {link(profile.whatsapp, "wa.me/919987157575")}</>,
        <>github    {link(profile.github, `github.com/${profile.githubHandle}`)}</>,
        <>linkedin  {link(profile.linkedin, `linkedin.com/in/${profile.linkedinHandle}`)}</>
      );
    }
    if (cmd === "resume" || cmd === "cv") {
      const a = document.createElement("a");
      a.href = RESUME_URL;
      a.download = "Yug_Jain_Resume.pdf";
      a.click();
      return out(<>Downloading… or open it {link(RESUME_URL, "here")}.</>);
    }
    if (cmd === "recruiter") {
      window.setTimeout(() => open("recruiter"), 200);
      return out("Switching to the recruiter view…");
    }
    if (cmd === "sudo hire yug" || cmd === "hire yug" || cmd === "sudo hire") {
      if (!cmd.startsWith("sudo")) {
        return [{ kind: "err", body: "Permission denied. Did you mean `sudo hire yug`?" }];
      }
      confetti();
      sfx("success");
      unlock("hire");
      const subject = encodeURIComponent("Let's talk: opportunity for Yug Jain");
      const body = encodeURIComponent(
        "Hi Yug,\n\nI saw your portfolio and would like to talk about a role.\n\n"
      );
      window.setTimeout(() => {
        window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      }, 900);
      return out(
        "[sudo] password for recruiter: ********",
        <span className="term-accent">✔ Access granted. Opening your mail client…</span>
      );
    }
    if (cmd === "matrix") {
      window.setTimeout(() => {
        close();
        runMatrix();
      }, 300);
      return out("Wake up, Neo…");
    }
    if (cmd === "play" || cmd === "game" || cmd === "arcade") {
      window.setTimeout(() => open("game"), 200);
      return out("Booting Cyber Runner…");
    }
    if (cmd === "sound" || cmd === "mute" || cmd === "unmute") {
      toggleMuted();
      return out(`Sound ${muted ? "on" : "off"}.`);
    }
    if (cmd === "god" || cmd === "godmode") {
      setGodMode(!godMode);
      return out(`God mode ${godMode ? "off" : "on"}.`);
    }
    if (cmd === "ask" || cmd.startsWith("ask ") || cmd === "chat") {
      window.setTimeout(() => {
        close();
        setChatOpen(true);
      }, 200);
      return out("Opening Ask Yug…");
    }
    if (cmd === "perf" || cmd === "stack" || cmd === "vitals" || cmd === "neofetch") {
      window.setTimeout(() => open("perf"), 200);
      return out("Collecting live metrics…");
    }
    if (cmd === "badges" || cmd === "trophies") {
      window.setTimeout(() => open("badges"), 200);
      return out("Opening the trophy case…");
    }
    if (cmd === "github" || cmd === "gh") {
      fetchGitHubStats()
        .then((g) =>
          setLines((prev) => [
            ...prev,
            ...out(
              <span className="term-accent">github.com/{profile.githubHandle} (live)</span>,
              `  public repos  ${g.repos}`,
              `  last push     ${g.lastPush ? new Date(g.lastPush).toDateString() : "n/a"}`,
              `  latest repo   ${g.latestRepo ?? "n/a"}`
            ),
          ])
        )
        .catch(() => setLines((prev) => [...prev, { kind: "err", body: "GitHub API unreachable (offline or rate-limited)." }]));
      return out("Querying api.github.com…");
    }
    if (cmd === "date") return out(new Date().toString());
    if (cmd.startsWith("echo ")) return out(input.slice(5));
    if (cmd === "clear" || cmd === "cls") return "clear";
    if (cmd === "exit" || cmd === "quit") {
      window.setTimeout(close, 100);
      return out("Bye 👋");
    }
    if (cmd.startsWith("sudo")) return [{ kind: "err", body: "Nice try. Only `sudo hire yug` is allowed here." }];
    return [{ kind: "err", body: `command not found: ${input}. Type \`help\`.` }];
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = run(value);
    sfx(result === "clear" || (Array.isArray(result) && result[0]?.kind !== "err") ? "click" : "error");
    if (result === "clear") setLines([]);
    else setLines((prev) => [...prev, { kind: "in", body: value }, ...result]);
    if (value.trim()) setHistory((h) => [value, ...h].slice(0, 50));
    setCursor(-1);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      if (history[next] !== undefined) {
        setCursor(next);
        setValue(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = cursor - 1;
      setCursor(Math.max(next, -1));
      setValue(next >= 0 ? history[next] : "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = Object.keys(COMMANDS).find((c) => c.startsWith(value.toLowerCase()) && value);
      if (match) setValue(match);
    }
  };

  return (
    <div className="ov-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        className="ov-panel term"
        role="dialog"
        aria-modal="true"
        aria-label="Developer terminal"
        ref={panelRef}
        onMouseUp={() => {
          if (!window.getSelection()?.toString()) inputRef.current?.focus();
        }}
      >
        <div className="term-bar">
          <span className="term-dot" aria-hidden="true" />
          <span className="term-dot" aria-hidden="true" />
          <span className="term-dot" aria-hidden="true" />
          <span className="term-title">yug@portfolio — zsh</span>
        </div>
        <button className="ov-close" onClick={close} aria-label="Close terminal" style={{ top: 4, right: 6, width: 30, height: 30 }}>
          <MdClose />
        </button>
        <div className="term-body" ref={bodyRef} role="log" aria-live="polite">
          {lines.map((line, i) => (
            <p key={i} className={`term-line term-${line.kind}`}>
              {line.body}
            </p>
          ))}
        </div>
        <form className="term-form" onSubmit={submit}>
          <label htmlFor="term-input" className="term-prompt">
            yug@portfolio:~$
          </label>
          <input
            id="term-input"
            ref={inputRef}
            className="term-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            data-own-tab
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-describedby="term-hint"
          />
          <span id="term-hint" className="ov-sr-only">
            Type help and press Enter to list commands.
          </span>
        </form>
      </div>
    </div>
  );
};

export default Terminal;
