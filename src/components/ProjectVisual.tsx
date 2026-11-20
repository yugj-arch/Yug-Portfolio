import { CSSProperties, PointerEvent } from "react";
import type { Project } from "../data/profile";
import "./overlays/overlays.css";

/**
 * Code-drawn preview of a project in a faux browser window. Lightweight (no image
 * download) and tilts toward the pointer.
 */
const ProjectVisual = ({ project, tilt = true }: { project: Project; tilt?: boolean }) => {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!tilt || e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--tiltY", `${x * 10}deg`);
    el.style.setProperty("--tiltX", `${-y * 10}deg`);
  };
  const onLeave = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--tiltY", "0deg");
    e.currentTarget.style.setProperty("--tiltX", "0deg");
  };

  return (
    <div
      className="pv"
      style={{ "--pv-accent": project.accent } as CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      role="img"
      aria-label={`Preview of ${project.title}: ${project.preview.headline}`}
    >
      <div className="pv-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span className="pv-url">{project.liveLabel}</span>
      </div>
      {project.shots?.[0] ? (
        <img
          className="pv-shot"
          src={project.shots[0].src}
          alt=""
          width={1425}
          height={900}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ) : (
      <div className="pv-body" aria-hidden="true">
        <span className="pv-kicker">{project.subtitle}</span>
        <p className="pv-title">{project.title}</p>
        <span className="pv-headline" dir="ltr">
          {project.preview.headline}
        </span>
        <div className="pv-lines">
          {project.preview.lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

export default ProjectVisual;
