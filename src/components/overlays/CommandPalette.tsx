import { KeyboardEvent, ReactNode, useMemo, useRef, useState } from "react";
import {
  MdArrowOutward,
  MdCall,
  MdSubdirectoryArrowRight,
  MdContentCopy,
  MdDescription,
  MdSpeed,
  MdEmojiEvents,
  MdGamepad,
  MdPerson,
  MdSearch,
  MdTag,
  MdTerminal,
  MdVolumeUp,
  MdWork,
} from "react-icons/md";
import { FaGithub, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { profile, projects, RESUME_URL, skills } from "../../data/profile";
import { useExperience } from "../../context/ExperienceProvider";
import { useDialog } from "../../hooks/useDialog";
import { scrollToSection } from "../../utils/scrollTo";

type Item = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon: ReactNode;
  run: () => void;
};

const external = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

const CommandPalette = () => {
  const xp = useExperience();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  useDialog(panelRef, inputRef);

  const items = useMemo<Item[]>(() => {
    const go = (selector: string) => () => {
      xp.close();
      window.setTimeout(() => scrollToSection(selector), 50);
    };
    const sections: Item[] = [
      ["Home", "#landingDiv"],
      ["About", "#about"],
      ["What I Do", "#whatido"],
      ["Experience", "#career"],
      ["Work", "#work"],
      ["Skills with receipts", "#skills"],
      ["Tech Stack", "#techstack"],
      ["Contact", "#contact"],
    ].map(([label, sel]) => ({
      id: `go-${sel}`,
      group: "Jump to",
      label,
      icon: <MdSubdirectoryArrowRight />,
      run: go(sel),
    }));

    const projectItems: Item[] = projects.map((p) => ({
      id: `p-${p.slug}`,
      group: "Projects",
      label: p.title,
      hint: p.subtitle,
      keywords: p.stack.join(" "),
      icon: <MdWork />,
      run: () => xp.openProject(p.slug),
    }));

    const actions: Item[] = [
      {
        id: "supreme",
        group: "Experiences",
        label: xp.godMode ? "Open Supreme control room" : "Unlock Supreme access",
        hint: "God mode · your own control room",
        keywords: "god godmode supreme secret special access konami",
        icon: <MdEmojiEvents />,
        run: () => xp.setGodMode(true),
      },
      {
        id: "matrix",
        group: "Experiences",
        label: "Enter the construct",
        hint: "Interactive Matrix rain",
        keywords: "matrix digital rain neo construct",
        icon: <MdTerminal />,
        run: xp.runMatrix,
      },
      {
        id: "recruiter",
        group: "Actions",
        label: "Recruiter view",
        hint: "Fast, one-page summary",
        keywords: "hire ats summary cv fast",
        icon: <MdPerson />,
        run: () => xp.open("recruiter"),
      },
      {
        id: "resume",
        group: "Actions",
        label: "Download resume (PDF)",
        keywords: "cv",
        icon: <MdDescription />,
        run: () => {
          xp.close();
          const a = document.createElement("a");
          a.href = RESUME_URL;
          a.download = "Yug_Jain_Resume.pdf";
          a.click();
        },
      },
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        hint: profile.email,
        keywords: "mail contact",
        icon: <MdContentCopy />,
        run: () => {
          xp.close();
          navigator.clipboard
            ?.writeText(profile.email)
            .then(() => xp.notify(`Copied ${profile.email}`))
            .catch(() => xp.notify(profile.email));
        },
      },
      {
        id: "terminal",
        group: "Actions",
        label: "Open terminal",
        hint: "Ctrl + `",
        keywords: "shell cli console",
        icon: <MdTerminal />,
        run: () => xp.open("terminal"),
      },
      {
        id: "arcade",
        group: "Actions",
        label: "Take a 60-second break",
        hint: "Cyber Runner",
        keywords: "game play arcade",
        icon: <MdGamepad />,
        run: () => xp.open("game"),
      },
      {
        id: "perf",
        group: "Actions",
        label: "Under the hood: live Web Vitals",
        hint: "How this site is built",
        keywords: "performance lighthouse architecture stack vitals speed",
        icon: <MdSpeed />,
        run: () => xp.open("perf"),
      },
      {
        id: "chat",
        group: "Actions",
        label: "Ask Yug (AI assistant)",
        hint: "Questions about his work",
        keywords: "chat bot ai assistant question",
        icon: <MdPerson />,
        run: () => {
          xp.close();
          xp.setChatOpen(true);
        },
      },
      {
        id: "badges",
        group: "Actions",
        label: "Trophy case",
        hint: `${xp.badges.length} badges found`,
        keywords: "badges achievements secrets easter eggs",
        icon: <MdEmojiEvents />,
        run: () => xp.open("badges"),
      },
      {
        id: "sound",
        group: "Actions",
        label: xp.muted ? "Turn sound on" : "Turn sound off",
        keywords: "audio mute volume",
        icon: <MdVolumeUp />,
        run: () => {
          xp.toggleMuted();
          xp.close();
        },
      },
    ];

    const links: Item[] = [
      { id: "gh", label: "GitHub", hint: profile.githubHandle, icon: <FaGithub />, run: () => external(profile.github) },
      {
        id: "li",
        label: "LinkedIn",
        hint: profile.linkedinHandle,
        icon: <FaLinkedinIn />,
        run: () => external(profile.linkedin),
      },
      { id: "wa", label: "WhatsApp", hint: profile.phone, icon: <FaWhatsapp />, run: () => external(profile.whatsapp) },
      {
        id: "call",
        label: "Call",
        hint: profile.phone,
        icon: <MdCall />,
        run: () => {
          window.location.href = `tel:${profile.phoneRaw}`;
        },
      },
      ...projects.map((p) => ({
        id: `live-${p.slug}`,
        label: `${p.title} (live)`,
        hint: p.liveLabel,
        icon: <MdArrowOutward />,
        run: () => external(p.live),
      })),
    ].map((l) => ({ ...l, group: "Links" }));

    const skillItems: Item[] = skills.flatMap((g) =>
      g.items.map((s) => ({
        id: `s-${g.group}-${s}`,
        group: "Skills",
        label: s,
        hint: g.group,
        icon: <MdTag />,
        run: () => {
          const used = projects.filter((p) =>
            p.stack.some((t) => t.toLowerCase().includes(s.split(" ")[0].toLowerCase()))
          );
          if (used.length) {
            xp.openProject(used[0].slug);
          } else {
            xp.close();
            xp.notify(`${s} — listed under ${g.group} in Yug's skills.`);
            window.setTimeout(() => scrollToSection("#techstack"), 50);
          }
        },
      }))
    );

    return [...actions, ...projectItems, ...sections, ...links, ...skillItems];
  }, [xp]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.filter((i) => i.group !== "Skills");
    const terms = q.split(/\s+/);
    return items.filter((i) => {
      const hay = `${i.label} ${i.hint ?? ""} ${i.keywords ?? ""} ${i.group}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [items, query]);

  const choose = (item: Item | undefined) => {
    if (!item) return;
    xp.sfx("click");
    item.run();
  };

  const move = (delta: number) => {
    if (!filtered.length) return;
    const next = (active + delta + filtered.length) % filtered.length;
    setActive(next);
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${next}"]`)
      ?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(filtered[active]);
    }
  };

  let lastGroup = "";
  const activeId = filtered[active] ? `pal-${filtered[active].id}` : undefined;

  return (
    <div
      className="ov-backdrop ov-backdrop-top"
      onMouseDown={(e) => e.target === e.currentTarget && xp.close()}
    >
      <div className="ov-panel pal" role="dialog" aria-modal="true" aria-label="Command palette" ref={panelRef}>
        <div className="pal-search">
          <MdSearch aria-hidden="true" />
          <input
            ref={inputRef}
            className="pal-input"
            placeholder="Search projects, skills, links, actions…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="pal-list"
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="ov-kbd">Esc</span>
        </div>
        <ul className="pal-list" id="pal-list" role="listbox" ref={listRef} aria-label="Results">
          {filtered.length === 0 && <li className="pal-empty">No results for “{query}”.</li>}
          {filtered.map((item, i) => {
            const header = item.group !== lastGroup;
            lastGroup = item.group;
            return [
              header && (
                <li key={`h-${item.group}`} className="pal-group" role="presentation">
                  {item.group}
                </li>
              ),
              <li
                key={item.id}
                id={`pal-${item.id}`}
                data-index={i}
                role="option"
                aria-selected={i === active}
                className="pal-item"
                onMouseMove={() => i !== active && setActive(i)}
                onClick={() => choose(item)}
              >
                <span className="pal-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
                {item.hint && <span className="pal-hint">{item.hint}</span>}
              </li>,
            ];
          })}
        </ul>
        <div className="pal-foot" aria-hidden="true">
          <span>
            <span className="ov-kbd">↑</span> <span className="ov-kbd">↓</span> navigate
          </span>
          <span>
            <span className="ov-kbd">Enter</span> select
          </span>
          <span>
            <span className="ov-kbd">Ctrl K</span> toggle
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
