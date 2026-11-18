import { lazy, Suspense, useEffect, useState } from "react";
import { useExperience } from "../../context/ExperienceProvider";
import { useKonami } from "../../hooks/useKonami";
import Dock from "./Dock";
import ScrollProgress from "./ScrollProgress";
import { useMagnetic } from "../../hooks/useMagnetic";
import "./overlays.css";

const Terminal = lazy(() => import("./Terminal"));
const CommandPalette = lazy(() => import("./CommandPalette"));
const ArcadeGame = lazy(() => import("./ArcadeGame"));
const RecruiterView = lazy(() => import("./RecruiterView"));
const ProjectModal = lazy(() => import("./ProjectModal"));
const MatrixRain = lazy(() => import("./MatrixRain"));
const TrophyCase = lazy(() => import("./TrophyCase"));
const ChatBot = lazy(() => import("./ChatBot"));
const UnderTheHood = lazy(() => import("./UnderTheHood"));

/** Everything that floats above the page. Heavy pieces load only when opened. */
const OverlayRoot = () => {
  const xp = useExperience();
  useKonami(() => xp.setGodMode(!xp.godMode));
  useMagnetic();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  useEffect(() => {
    if (xp.online) setBannerDismissed(false);
  }, [xp.online]);

  return (
    <>
      {!xp.online && !bannerDismissed && (
        <div className="ov-offline" role="status">
          <span>You are offline — but Yug&apos;s code never sleeps!</span>
          <button className="ov-btn" onClick={() => xp.open("game")}>
            Play offline
          </button>
          <button className="ov-offline-x" onClick={() => setBannerDismissed(true)} aria-label="Dismiss offline notice">
            ×
          </button>
        </div>
      )}

      <ScrollProgress />
      <Dock />
      {xp.overlay !== "recruiter" && (
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      )}

      <Suspense fallback={null}>
        {xp.overlay === "recruiter" && <RecruiterView />}
        {xp.overlay === "terminal" && <Terminal />}
        {xp.overlay === "palette" && <CommandPalette />}
        {xp.overlay === "game" && <ArcadeGame />}
        {xp.overlay === "badges" && <TrophyCase />}
        {xp.overlay === "perf" && <UnderTheHood />}
        {xp.projectSlug && <ProjectModal key={xp.projectSlug} slug={xp.projectSlug} />}
        {xp.matrix && <MatrixRain />}
      </Suspense>

      <div aria-live="polite" className="ov-sr-only-wrap">
        {xp.toast && (
          <div className="ov-toast" role="status">
            {xp.toast}
          </div>
        )}
      </div>
    </>
  );
};

export default OverlayRoot;
