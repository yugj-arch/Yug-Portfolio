import { useState, useCallback } from "react";
import "./styles/Work.css";
import ProjectVisual from "./ProjectVisual";
import { MdArrowBack, MdArrowForward, MdArrowOutward } from "react-icons/md";
import { projects } from "../data/profile";
import { useExperience } from "../context/ExperienceProvider";

const Work = () => {
  const { openProject } = useExperience();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  const goToPrev = useCallback(() => {
    const newIndex =
      currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex =
      currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div className="carousel-wrapper">
          {/* Navigation Arrows */}
          <button
            className="carousel-arrow carousel-arrow-left"
            data-magnetic
            onClick={goToPrev}
            aria-label="Previous project"
            data-cursor="disable"
          >
            <MdArrowBack />
          </button>
          <button
            className="carousel-arrow carousel-arrow-right"
            data-magnetic
            onClick={goToNext}
            aria-label="Next project"
            data-cursor="disable"
          >
            <MdArrowForward />
          </button>

          {/* Slides */}
          <div className="carousel-track-container">
            <div
              className={`carousel-track carousel-track-${currentIndex}`}
            >
              {projects.map((project, index) => (
                <div
                  className="carousel-slide"
                  key={project.slug}
                  aria-hidden={index !== currentIndex}
                >
                  <div className="carousel-content">
                    <div className="carousel-info">
                      <div className="carousel-number">
                        <h3>0{index + 1}</h3>
                      </div>
                      <div className="carousel-details">
                        <h4>{project.title}</h4>
                        <p className="carousel-category">
                          {project.subtitle} · {project.category}
                        </p>
                        <p className="carousel-summary">{project.summary}</p>
                        <div className="carousel-tools">
                          <span className="tools-label">Tools & Features</span>
                          <p>{project.stack.join(", ")}</p>
                        </div>
                        <div className="carousel-actions">
                          <button
                            className="carousel-cta carousel-cta-primary"
                            data-magnetic
                            onClick={() => openProject(project.slug)}
                            data-cursor="disable"
                            tabIndex={index === currentIndex ? 0 : -1}
                          >
                            Case study
                          </button>
                          <a
                            className="carousel-cta"
                            data-magnetic
                            href={project.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor="disable"
                            tabIndex={index === currentIndex ? 0 : -1}
                          >
                            Live site <MdArrowOutward />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="carousel-image-wrapper">
                      <ProjectVisual project={project} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="carousel-dots">
            {projects.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? "carousel-dot-active" : ""
                  }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to project ${index + 1}`}
                data-cursor="disable"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
