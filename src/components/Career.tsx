import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          Certifications <span>&</span>
          <br /> Activities
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Google AI-ML Virtual Internship</h4>
                <h5>EduSkills Foundation</h5>
              </div>
              <h3>2025</h3>
            </div>
            <p>
              Gained hands-on experience utilizing Google Cloud services to deploy TensorFlow models. Applied principles of Responsible AI and mastered core deep learning concepts.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>TCS iON Career Edge</h4>
                <h5>Tata Consultancy Services</h5>
              </div>
              <h3>2025</h3>
            </div>
            <p>
              Cultivated professional communication skills, demonstrated proficiency in modern digital tools, and implemented structured problem-solving frameworks for long-term career growth.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Data Analytics Job Simulation</h4>
                <h5>Deloitte / Forage</h5>
              </div>
              <h3>2025</h3>
            </div>
            <p>
              Executed end-to-end data analysis workflows including defining KPIs. Designed professional visualizations to effectively communicate complex analytical findings and strategic recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
