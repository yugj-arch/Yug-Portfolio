import { useExperience } from "../context/ExperienceProvider";
import { profile } from "../data/profile";

/** Shown when the 3D site can't load (usually: offline on a first visit). */
const SceneFallback = () => {
  const { open, online } = useExperience();
  return (
    <div className="scene-fallback" role="alert">
      <h1>{profile.name}</h1>
      <p>{profile.tagline}</p>
      <p className="scene-fallback-note">
        {online
          ? "The 3D experience couldn't load. Reload to try again, or use the fast view."
          : "You're offline, so the 3D experience can't load right now. Yug's code never sleeps, though:"}
      </p>
      <div className="scene-fallback-actions">
        <button className="ov-btn ov-btn-primary" onClick={() => open("recruiter")}>
          Open recruiter view
        </button>
        <button className="ov-btn" onClick={() => open("game")}>
          Play Cyber Runner
        </button>
        {online && (
          <button className="ov-btn" onClick={() => window.location.reload()}>
            Reload
          </button>
        )}
      </div>
    </div>
  );
};

export default SceneFallback;
