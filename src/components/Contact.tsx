import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Location</h4>
            <p>Mumbai, Maharashtra, India</p>
            <h4>Email & Phone</h4>
            <p>
              <a href="mailto:yug.18175@sakec.ac.in" data-cursor="disable">
                yug.18175@sakec.ac.in
              </a>
              <br />
              <a href="tel:+919987157575" data-cursor="disable">
                +91 9987157575
              </a>
            </p>
            <h4>Education</h4>
            <p>
              <strong>B.Tech in Electronics & Computer Science Engineering</strong>
              <br />
              Shah & Anchor Kutchhi Engineering College
              <br />
              Honors in AIML (Expected 2027)
            </p>
            <p>
              <strong>St. Xavier’s Boys Academy, Mumbai</strong>
              <br />
              SSC (2021)
            </p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a
              href="https://github.com/yug-max"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Github <MdArrowOutward />
            </a>
            <a
              href="https://www.linkedin.com/in/yug-jain-b74556341"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Linkedin <MdArrowOutward />
            </a>
            <a
              href="https://leetcode.com/u/yug-max/"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              LeetCode <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by <span>Yug Jain</span>
            </h2>
            <h5>
              <MdCopyright /> 2026
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
