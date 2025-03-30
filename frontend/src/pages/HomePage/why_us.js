import React from 'react';
import './why_us.css';
import whyus from './../../assets/whyus.png';

const WhyUs = () => {
  return (
    <div className="why-us-container">
      <div className="why-us-grid">
        <div className="image-container">
          <img
            src= {whyus}
            alt="Medical professional with patient"
            className="why-us-image"
          />
          
          <div className="image-dots">
            {[0, 1, 2, 3, 4].map((dot) => (
              <div
                key={dot}
                className={`image-dot ${dot === 0 ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="content-container">
          <h2 className="why-us-title">
            Pourquoi SanoX?
          </h2>
          <p className="why-us-description">
            Lorem ipsum dolor sit amet consectetur. Mattis habitant eget aug dis ac at semper. Nulla qid ut dui in risus elit ut volutpat cras. Sit viverra vitae venenatis condimentum a neque nec augue quisque. Interdum in egestas convallis netus sed pretium.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhyUs;