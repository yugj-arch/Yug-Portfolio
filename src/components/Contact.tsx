import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";
import { education, profile, RESUME_URL } from "../data/profile";
import LocalTime from "./LocalTime";
import { useExperience } from "../context/ExperienceProvider";

const Contact = () => {
  const { open } = useExperience();
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Location</h4>
            <p>
              {profile.location}
              <br />
              <LocalTime />
            </p>
            <h4>Email & Phone</h4>
            <p>
              <a href={`mailto:${profile.email}`} data-cursor="disable">
                {profile.email}
              </a>
              <br />
              <a href={`tel:${profile.phoneRaw}`} data-cursor="disable">
                {profile.phone}
              </a>
            </p>
            <h4>Education</h4>
            <p>
              <strong>{education.degree}</strong>
              <br />
              {education.school}
              <br />
              CGPA {education.cgpa} · {education.period}
            </p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Github <MdArrowOutward />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Linkedin <MdArrowOutward />
            </a>
            <a
              href={profile.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              WhatsApp <MdArrowOutward />
            </a>
            <a
              href={RESUME_URL}
              download="Yug_Jain_Resume.pdf"
              data-cursor="disable"
              className="contact-social"
            >
              Resume (PDF) <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by <span>{profile.name}</span>
            </h2>
            <h5>
              <MdCopyright /> {new Date().getFullYear()}
            </h5>
            <button className="contact-hood" onClick={() => open("perf")} data-cursor="disable">
              How this site is built, measured live
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
