import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/Navbar.css";
import { profile } from "../data/profile";
import { useExperience } from "../context/ExperienceProvider";
import { scrollToSection } from "../utils/scrollTo";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

const Navbar = () => {
  const { open } = useExperience();
  useEffect(() => {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1.1,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);
    smoother.paused(true);

    const onResize = () => {
      ScrollSmoother.refresh(true);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      smoother.kill();
    };
  }, []);
  return (
    <>
      <div className="header">
        <a href="#landingDiv" className="navbar-title" aria-label="Yug Jain, back to top" data-cursor="disable" onClick={(event) => {
          event.preventDefault();
          void scrollToSection("#landingDiv");
        }}>
          YJ
        </a>
        <button
          type="button"
          className="navbar-mode"
          data-magnetic
          onClick={() => open("recruiter")}
          data-cursor="disable"
          title="Fast, one-page view for recruiters"
        >
          <span className="navbar-mode-dot" aria-hidden="true" />
          RECRUITER MODE
        </button>
        <a
          href={`mailto:${profile.email}`}
          className="navbar-connect"
          data-cursor="disable"
        >
          {profile.email}
        </a>
        <ul onClick={(event) => {
          const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[data-href]");
          if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          void scrollToSection(link.dataset.href!);
        }}>
          <li>
            <a data-href="#about" href="#about" aria-label="About">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work" aria-label="Work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact" aria-label="Contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
