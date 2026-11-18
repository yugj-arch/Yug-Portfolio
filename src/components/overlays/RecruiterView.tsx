import { useEffect, useRef, useState } from "react";
import { MdArrowOutward, MdCall, MdContentCopy, MdDownload, MdViewInAr } from "react-icons/md";
import { FaGithub, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import {
  education,
  experience,
  metrics,
  profile,
  projects,
  RESUME_URL,
  simulations,
  skills,
  strengths,
} from "../../data/profile";
import { useExperience } from "../../context/ExperienceProvider";
import { useDialog } from "../../hooks/useDialog";
import "./recruiter.css";
import { repos } from "../../data/github";
import LocalTime from "../LocalTime";
import { fetchGitHubStats, GitHubStats } from "../../utils/github";

/** Fast, print-friendly one-pager for recruiters. No WebGL, no animation. */
const RecruiterView = () => {
  const { close, notify, openProject, sfx } = useExperience();
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useDialog(rootRef, headingRef);
  const [gh, setGh] = useState<GitHubStats | null>(null);
  useEffect(() => {
    fetchGitHubStats().then(setGh).catch(() => undefined);
  }, []);

  const copyEmail = () => {
    sfx("click");
    navigator.clipboard
      ?.writeText(profile.email)
      .then(() => notify(`Copied ${profile.email}`))
      .catch(() => notify(profile.email));
  };

  return (
    <div className="rv" role="dialog" aria-modal="true" aria-labelledby="rv-name" ref={rootRef}>
      <div className="rv-topbar">
        <span className="rv-badge">Recruiter view</span>
        <button className="rv-switch" onClick={close}>
          <MdViewInAr aria-hidden="true" /> Switch to 3D experience
        </button>
      </div>

      <div className="rv-page">
        <header className="rv-header">
          <div>
            <h1 id="rv-name" ref={headingRef} tabIndex={-1}>
              {profile.name}
            </h1>
            <p className="rv-tagline">{profile.tagline}</p>
            <p className="rv-meta">
              {profile.location} · Full-Stack Developer Intern at DotSyndicate · Open to varied roles, locations and
              shifts
            </p>
            <p className="rv-meta">
              <LocalTime />
            </p>
          </div>
          <div className="rv-cta">
            <a className="rv-btn rv-btn-primary" href={RESUME_URL} download="Yug_Jain_Resume.pdf">
              <MdDownload aria-hidden="true" /> Download resume
            </a>
            <button className="rv-btn" onClick={copyEmail}>
              <MdContentCopy aria-hidden="true" /> Copy email
            </button>
            <a className="rv-btn" href={profile.whatsapp} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp aria-hidden="true" /> WhatsApp
            </a>
            <a className="rv-btn" href={`tel:${profile.phoneRaw}`}>
              <MdCall aria-hidden="true" /> Call
            </a>
            <a className="rv-btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn aria-hidden="true" /> LinkedIn
            </a>
            <a className="rv-btn" href={profile.github} target="_blank" rel="noopener noreferrer">
              <FaGithub aria-hidden="true" /> GitHub
            </a>
          </div>
        </header>

        <ul className="rv-metrics" aria-label="At a glance">
          {metrics.map((m) => (
            <li key={m.label}>
              <strong>{m.value}</strong>
              <span>{m.label}</span>
            </li>
          ))}
          {gh && (
            <li className="rv-live">
              <strong>{gh.repos}</strong>
              <span>
                Public GitHub repos · live
                {gh.lastPush && <> · last push {new Date(gh.lastPush).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>}
              </span>
            </li>
          )}
        </ul>

        <section aria-labelledby="rv-summary">
          <h2 id="rv-summary">Summary</h2>
          <p>{profile.summary}</p>
        </section>

        <section aria-labelledby="rv-exp">
          <h2 id="rv-exp">Experience</h2>
          {experience.map((job) => (
            <article className="rv-item" key={job.role}>
              <div className="rv-item-head">
                <h3>
                  {job.role} — {job.org}
                </h3>
                <span>{job.period}</span>
              </div>
              <ul>
                {job.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section aria-labelledby="rv-projects">
          <h2 id="rv-projects">Projects</h2>
          <div className="rv-projects">
            {projects.map((p) => (
              <article className="rv-project" key={p.slug}>
                <p className="rv-project-cat">{p.category}</p>
                <h3>{p.title}</h3>
                <p className="rv-project-sub">{p.subtitle}</p>
                <ul>
                  {p.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <p className="rv-stack">{p.stack.join(" · ")}</p>
                <div className="rv-project-links">
                  <a href={p.live} target="_blank" rel="noopener noreferrer">
                    {p.liveLabel} <MdArrowOutward aria-hidden="true" />
                  </a>
                  {p.repo && (
                    <a href={p.repo} target="_blank" rel="noopener noreferrer">
                      Source <MdArrowOutward aria-hidden="true" />
                    </a>
                  )}
                  <button onClick={() => openProject(p.slug)}>Architecture & details</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="rv-github">
          <h2 id="rv-github">More on GitHub</h2>
          <ul>
            {repos
              .filter((r) => !projects.some((p) => p.live === r.live))
              .map((r) => (
                <li key={r.name}>
                  <strong>{r.title}</strong> — {r.summary}{" "}
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {r.url.replace("https://", "")}
                  </a>
                  <br />
                  <span className="rv-note">
                    {r.stack.slice(0, 6).join(" · ")} — {r.authorship}
                  </span>
                </li>
              ))}
          </ul>
        </section>

        <section aria-labelledby="rv-skills">
          <h2 id="rv-skills">Technical skills</h2>
          <dl className="rv-skills">
            {skills.map((g) => (
              <div key={g.group}>
                <dt>{g.group}</dt>
                <dd>{g.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="rv-two">
          <section aria-labelledby="rv-edu">
            <h2 id="rv-edu">Education</h2>
            <div className="rv-item-head">
              <h3>{education.school}</h3>
            </div>
            <p>
              {education.degree} · CGPA {education.cgpa} · {education.period}
            </p>
            <h2 className="rv-h2-spaced">Job simulations</h2>
            <ul>
              {simulations.map((s) => (
                <li key={s.title}>
                  {s.title} — {s.org}, {s.year}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="rv-strengths">
            <h2 id="rv-strengths">Strengths</h2>
            <ul>
              {strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="rv-footer">
          <p>
            {profile.email} · {profile.phone} · github.com/{profile.githubHandle} · linkedin.com/in/
            {profile.linkedinHandle}
          </p>
          <button className="rv-btn" onClick={() => window.print()}>
            Print this page
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RecruiterView;
