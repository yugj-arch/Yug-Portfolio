import { useRef } from "react";
import { MdClose } from "react-icons/md";
import { BADGES } from "../../data/badges";
import { useExperience } from "../../context/ExperienceProvider";
import { useDialog } from "../../hooks/useDialog";

const TrophyCase = () => {
  const { close, badges } = useExperience();
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(panelRef);
  const pct = Math.round((badges.length / BADGES.length) * 100);

  return (
    <div className="ov-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="ov-panel trophy" role="dialog" aria-modal="true" aria-labelledby="trophy-title" ref={panelRef}>
        <button className="ov-close" onClick={close} aria-label="Close trophy case">
          <MdClose />
        </button>
        <h2 id="trophy-title">Trophy case</h2>
        <p className="trophy-sub">
          {badges.length} of {BADGES.length} hidden badges found. Locked ones show a hint.
        </p>
        <div
          className="trophy-bar"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Badges found"
        >
          <span style={{ width: `${pct}%` }} />
        </div>
        <ul className="trophy-grid">
          {BADGES.map((b) => {
            const got = badges.includes(b.id);
            return (
              <li key={b.id} className={got ? "trophy-got" : "trophy-locked"}>
                <span className="trophy-emoji" aria-hidden="true">
                  {got ? b.emoji : "🔒"}
                </span>
                <strong>{got ? b.name : "???"}</strong>
                <span className="trophy-hint">{got ? "Unlocked" : b.hint}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default TrophyCase;
