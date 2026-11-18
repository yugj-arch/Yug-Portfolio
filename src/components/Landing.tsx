import { lazy, PropsWithChildren, Suspense, useState } from "react";
import "./styles/Landing.css";

const HeroParticles = lazy(() => import("./HeroParticles"));

// Desktop-class devices only: phones keep the lighter page.
function canRunParticles() {
  if (typeof window === "undefined") return false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  return !reduced && finePointer && window.innerWidth > 1024 && cores >= 4;
}

const Landing = ({ children }: PropsWithChildren) => {
  const [particles] = useState(canRunParticles);
  return (
    <>
      <div className="landing-section" id="landingDiv">
        {particles && (
          <Suspense fallback={null}>
            <HeroParticles />
          </Suspense>
        )}
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              YUG
              <br />
              <span>JAIN</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>Software Engineer</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">Full-Stack</div>
              <div className="landing-h2-2">AI / ML</div>
            </h2>
            <h2>
              <div className="landing-h2-info">Developer</div>
              <div className="landing-h2-info-1">Engineer</div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
