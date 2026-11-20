import { useRef } from "react";
import { MdArrowForward, MdClose, MdTerminal, MdVolumeOff, MdVolumeUp } from "react-icons/md";
import { useExperience } from "../../context/ExperienceProvider";
import { useDialog } from "../../hooks/useDialog";
import { THEMES } from "../../data/themes";

const Supreme = () => {
  const xp = useExperience();
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref);
  return (
    <div className="ov-backdrop supreme-backdrop" onMouseDown={(event) => event.target === event.currentTarget && xp.close()}>
      <div className="ov-panel supreme" role="dialog" aria-modal="true" aria-labelledby="supreme-title" ref={ref} tabIndex={-1}>
        <button className="ov-close" aria-label="Close Supreme control room" onClick={xp.close}><MdClose /></button>
        <div className="supreme-status"><span /> ACCESS GRANTED <span className="supreme-status-id">YJ / LEVEL ∞</span></div>
        <div className="supreme-orbit" aria-hidden="true"><span>✦</span></div>
        <p className="supreme-eyebrow">YOU FOUND THE OTHER SIDE</p>
        <h2 id="supreme-title">Welcome to <em>Supreme.</em></h2>
        <p className="supreme-lead">A little less ordinary. A lot more control.<br />Make this corner of the internet yours.</p>
        <button className="supreme-matrix" onClick={xp.runMatrix}>
          <span className="supreme-matrix-glyph" aria-hidden="true">ネオ</span>
          <span><strong>Enter the construct</strong><small>Interactive digital rain. Your pace. Your way out.</small></span>
          <MdArrowForward aria-hidden="true" />
        </button>
        <div className="supreme-tools">
          <div className="supreme-theme">
            <h3>Choose your frequency</h3>
            <div className="supreme-swatches">
              {Object.entries(THEMES).map(([name, theme]) => (
                <button key={name} style={{ background: theme.accent }} onClick={() => xp.notify(xp.setTheme(name))} aria-label={`Set ${name} theme`} title={name} />
              ))}
            </div>
            <p>Your theme stays saved beneath the gold.</p>
          </div>
          <div className="supreme-shortcuts">
            <button onClick={xp.toggleMuted}>{xp.muted ? <MdVolumeOff /> : <MdVolumeUp />} Sound {xp.muted ? "off" : "on"}</button>
            <button onClick={() => xp.open("terminal")}><MdTerminal /> Open terminal</button>
          </div>
        </div>
        <div className="supreme-footer">
          <button className="supreme-return" onClick={xp.close}>Explore with Supreme on <MdArrowForward /></button>
          <button className="supreme-leave" onClick={() => xp.setGodMode(false)}>Leave god mode</button>
        </div>
        <p className="supreme-footnote">Unlocked on this device · Yours to revisit</p>
      </div>
    </div>
  );
};
export default Supreme;
