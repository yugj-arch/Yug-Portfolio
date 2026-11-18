import { useMemo, useState } from "react";
import { skills } from "../data/profile";
import { evidenceFor } from "../utils/localBot";
import "./styles/SkillsMatrix.css";

/**
 * Every skill on the resume. Skills backed by shipped work get a card listing where they
 * were used; the rest are listed plainly instead of being padded out.
 */
const SkillsMatrix = () => {
  const [group, setGroup] = useState<string>("All");

  const rows = useMemo(
    () =>
      skills.flatMap((g) =>
        g.items.map((item) => ({ item, group: g.group, evidence: evidenceFor(item) }))
      ),
    []
  );
  const inGroup = group === "All" ? rows : rows.filter((r) => r.group === group);
  const proven = inGroup.filter((r) => r.evidence.length);
  const listed = inGroup.filter((r) => !r.evidence.length);
  const provenTotal = rows.filter((r) => r.evidence.length).length;
  const groups = ["All", ...skills.map((g) => g.group)];

  return (
    <section className="skills-section section-container" id="skills" aria-labelledby="skills-title">
      <div className="skills-head">
        <h2 id="skills-title">
          Skills, <span>with receipts</span>
        </h2>
        <p>
          {provenTotal} of the {rows.length} skills on the resume are backed by shipped work. Each card says where.
        </p>
      </div>

      <div className="skills-filters" role="group" aria-label="Filter skills by group">
        {groups.map((g) => (
          <button
            key={g}
            aria-pressed={group === g}
            className={group === g ? "is-active" : ""}
            onClick={() => setGroup(g)}
            data-cursor="disable"
          >
            {g}
          </button>
        ))}
      </div>

      {proven.length > 0 && (
        <ul className="skills-grid">
          {proven.map((r) => (
            <li key={`${r.group}-${r.item}`}>
              <div className="skills-top">
                <strong>{r.item}</strong>
                <span>{r.group}</span>
              </div>
              <ul className="skills-proof">
                {r.evidence.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {listed.length > 0 && (
        <div className="skills-also">
          <h3>Also on the resume</h3>
          <ul>
            {listed.map((r) => (
              <li key={`${r.group}-${r.item}`}>{r.item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default SkillsMatrix;
