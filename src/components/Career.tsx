import "./styles/Career.css";
import { education, experience, simulations } from "../data/profile";

const Career = () => {
  return (
    <div className="career-section section-container" id="career">
      <div className="career-container">
        <h2>
          Experience <span>&</span>
          <br /> Learning
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {experience.map((job) => (
            <div className="career-info-box" key={job.role}>
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{job.role}</h4>
                  <h5>
                    {job.org} · {job.period}
                  </h5>
                </div>
                <h3>NOW</h3>
              </div>
              <p>
                Ship client websites end to end with Next.js, React and Node.js; integrated Firebase
                Authentication, Firestore and Storage; review teammates&apos; code, test across devices and
                deploy to production while working directly with stakeholders.
              </p>
            </div>
          ))}
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>B.Tech, Electronics & Computer Science</h4>
                <h5>{education.school}</h5>
              </div>
              <h3>2027</h3>
            </div>
            <p>
              CGPA {education.cgpa}, {education.period.toLowerCase()}. Core CS: data structures and algorithms,
              OOP, debugging, code review, unit testing and REST API design.
            </p>
          </div>
          {simulations.map((s) => (
            <div className="career-info-box" key={s.title}>
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{s.title}</h4>
                  <h5>{s.org}</h5>
                </div>
                <h3>{s.year}</h3>
              </div>
              <p>Completed {s.org.replace(" (Forage)", "")}&apos;s virtual job simulation on Forage.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
