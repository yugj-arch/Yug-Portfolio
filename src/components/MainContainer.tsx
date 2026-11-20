import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import SkillsMatrix from "./SkillsMatrix";
import setSplitText from "./utils/splitText";
import LazyMount from "./LazyMount";

const TechStack = lazy(() => import("./TechStack"));
const HeroParticles = lazy(() => import("./HeroParticles"));

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );
  const [particles] = useState(() =>
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    window.matchMedia("(pointer: fine)").matches &&
    (navigator.hardwareConcurrency ?? 4) >= 4
  );

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      {isDesktopView && particles && (
        <Suspense fallback={null}><HeroParticles /></Suspense>
      )}
      {isDesktopView && children}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <Landing>{!isDesktopView && children}</Landing>
            <About />
            <WhatIDo />
            <Work />
            <Career />
            <SkillsMatrix />
            {isDesktopView && (
              <LazyMount
                fallback={
                  <section className="techstack" id="techstack" aria-label="Technical skills">
                    <h2>
                      Technical Skills <br />
                      <span className="tech-skills-list">React · Next.js · TypeScript · Node.js · Python · PyTorch</span>
                    </h2>
                  </section>
                }
              >
                <Suspense fallback={<section className="techstack" id="techstack" />}>
                  <TechStack />
                </Suspense>
              </LazyMount>
            )}
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
