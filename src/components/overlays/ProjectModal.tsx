import { useRef } from "react";
import { MdArrowBack, MdArrowForward, MdArrowOutward, MdClose } from "react-icons/md";
import { FaGithub } from "react-icons/fa6";
import { projects } from "../../data/profile";
import { repos } from "../../data/github";
import { useExperience } from "../../context/ExperienceProvider";
import { useDialog } from "../../hooks/useDialog";
import ProjectVisual from "../ProjectVisual";

const ProjectModal = ({ slug }: { slug: string }) => {
  const { closeProject, openProject } = useExperience();
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(panelRef);

  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  if (!project) return null;
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const titleId = `pm-title-${project.slug}`;
  const readme = repos.find((r) => r.live === project.live);

  return (
    <div
      className="ov-backdrop"
      style={{ zIndex: "calc(var(--ov-z) + 3)" }}
      onMouseDown={(e) => e.target === e.currentTarget && closeProject()}
    >
      <div
        className="ov-panel pm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
        tabIndex={-1}
      >
        <button className="ov-close" onClick={closeProject} aria-label="Close project details">
          <MdClose />
        </button>

        <div className="pm-head">
          <div>
            <p className="pm-cat">{project.category}</p>
            <h2 id={titleId}>{project.title}</h2>
            <p className="pm-sub">{project.subtitle}</p>
            <p className="pm-summary">{project.summary}</p>
            <div className="pm-actions">
              <a className="ov-btn ov-btn-primary" href={project.live} target="_blank" rel="noopener noreferrer">
                Visit live site <MdArrowOutward />
              </a>
              {project.repo && (
                <a className="ov-btn" href={project.repo} target="_blank" rel="noopener noreferrer">
                  <FaGithub /> Source code
                </a>
              )}
            </div>
          </div>
          <ProjectVisual project={project} />
        </div>

        {project.shots && project.shots.length > 0 && (
          <section className="pm-section" aria-labelledby={`${titleId}-shots`}>
            <h3 id={`${titleId}-shots`}>Screenshots</h3>
            <div className="pm-shots">
              {project.shots.map((s) => (
                <figure key={s.src}>
                  <img src={s.src} alt={s.caption} width={1425} height={900} loading="lazy" decoding="async" />
                  <figcaption>{s.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="pm-section" aria-labelledby={`${titleId}-arch`}>
          <h3 id={`${titleId}-arch`}>Architecture</h3>
          <dl className="pm-arch">
            {project.architecture.map((row) => (
              <div key={row.layer}>
                <dt>{row.layer}</dt>
                <dd>{row.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="pm-section" aria-labelledby={`${titleId}-ch`}>
          <h3 id={`${titleId}-ch`}>Problems solved</h3>
          <div className="pm-challenges">
            {project.challenges.map((c) => (
              <article className="pm-challenge" key={c.problem}>
                <strong>{c.problem}</strong>
                <p>{c.solution}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pm-section" aria-labelledby={`${titleId}-built`}>
          <h3 id={`${titleId}-built`}>What I built</h3>
          <ul className="pm-points">
            {project.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        {readme && (
          <section className="pm-section" aria-labelledby={`${titleId}-readme`}>
            <h3 id={`${titleId}-readme`}>From the GitHub README</h3>
            <ul className="pm-points">
              {readme.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="pm-section" aria-labelledby={`${titleId}-stack`}>
          <h3 id={`${titleId}-stack`}>Stack</h3>
          <div className="ov-tags">
            {project.stack.map((s) => (
              <span className="ov-tag" key={s}>
                {s}
              </span>
            ))}
          </div>
        </section>

        <nav className="pm-nav" aria-label="More projects">
          <button className="ov-btn" onClick={() => openProject(prev.slug)}>
            <MdArrowBack /> {prev.title}
          </button>
          <button className="ov-btn" onClick={() => openProject(next.slug)}>
            {next.title} <MdArrowForward />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ProjectModal;
