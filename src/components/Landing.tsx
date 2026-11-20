import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { MdArrowDownward, MdArrowOutward } from "react-icons/md";
import { scrollToSection } from "../utils/scrollTo";
import { RESUME_URL } from "../data/profile";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
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
          <div className="landing-actions">
            <p>From an idea to something people use.</p>
            <div className="landing-action-links">
              <a className="landing-cta" href="#work" data-cursor="disable" onClick={(event) => {
                event.preventDefault();
                void scrollToSection("#work");
              }}>
                Explore my work <MdArrowDownward aria-hidden="true" />
              </a>
              <a className="landing-resume" href={RESUME_URL} target="_blank" rel="noopener noreferrer" data-cursor="disable">
                View resume <MdArrowOutward aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
