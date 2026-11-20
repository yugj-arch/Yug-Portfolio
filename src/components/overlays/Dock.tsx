import { useEffect, useState } from "react";
import { MdEmojiEvents, MdGamepad, MdHeadphones, MdPerson, MdSearch, MdTerminal, MdVolumeOff, MdVolumeUp } from "react-icons/md";
import { BADGES } from "../../data/badges";
import { useExperience } from "../../context/ExperienceProvider";

/** Floating shortcuts: recruiter view, search, terminal, arcade, sound. */
const Dock = () => {
  const { open, overlay, muted, toggleMuted, badges, lofi, toggleLofi } = useExperience();
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const mod = isMac ? "⌘" : "Ctrl";
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`dock${pastHero ? "" : " dock-hidden-mobile"}`} aria-label="Quick actions" data-cursor="disable">
      <button className="dock-btn" onClick={() => open("recruiter")} aria-pressed={overlay === "recruiter"}>
        <MdPerson aria-hidden="true" />
        <span className="dock-tip">Recruiter view</span>
        <span className="ov-sr-only">Open recruiter view</span>
      </button>
      <button className="dock-btn" onClick={() => open("palette")} aria-keyshortcuts="Control+K Meta+K">
        <MdSearch aria-hidden="true" />
        <span className="dock-tip">Search ({mod} K)</span>
        <span className="ov-sr-only">Open command palette</span>
      </button>
      <button className="dock-btn" onClick={() => open("terminal")} aria-keyshortcuts="Control+`">
        <MdTerminal aria-hidden="true" />
        <span className="dock-tip">Terminal (Ctrl `)</span>
        <span className="ov-sr-only">Open terminal</span>
      </button>
      <button className="dock-btn" onClick={() => open("game")}>
        <MdGamepad aria-hidden="true" />
        <span className="dock-tip">Take a 60-second break</span>
        <span className="ov-sr-only">Play Cyber Runner</span>
      </button>
      <button className="dock-btn" onClick={() => open("badges")}>
        <MdEmojiEvents aria-hidden="true" />
        {badges.length > 0 && <span className="dock-count">{badges.length}</span>}
        <span className="dock-tip">
          Trophy case ({badges.length}/{BADGES.length})
        </span>
        <span className="ov-sr-only">
          Open trophy case, {badges.length} of {BADGES.length} badges found
        </span>
      </button>
      <button className={`dock-btn${lofi ? " dock-btn-live" : ""}`} onClick={toggleLofi} aria-pressed={lofi}>
        <MdHeadphones aria-hidden="true" />
        <span className="dock-tip">{lofi ? "Stop lo-fi" : "Play lo-fi"}</span>
        <span className="ov-sr-only">Chill lo-fi music</span>
      </button>
      <button className="dock-btn" onClick={toggleMuted} aria-pressed={!muted}>
        {muted ? <MdVolumeOff aria-hidden="true" /> : <MdVolumeUp aria-hidden="true" />}
        <span className="dock-tip">{muted ? "Sound off" : "Sound on"}</span>
        <span className="ov-sr-only">UI sound</span>
      </button>
    </nav>
  );
};

export default Dock;
