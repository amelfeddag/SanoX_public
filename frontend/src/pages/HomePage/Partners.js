import React from 'react';
import './Partners.css';
import pratner1 from './../../assets/cbc.png'
import partner2 from './../../assets/chu.png' 
const Partners = () => {
  const partners = [
    {
      id: 1,
      name: 'CBC',
      logo: pratner1  ,
    },
    {
      id: 2,
      name: 'Red Crescent',
      logo: partner2 , 
    }
  ];

  return (
    <div className="partners-container" id = 'partners'>
      <h2 className="partners-title">Adapté par</h2>
      <div className="partners-scroll-container">
        <div className="partners-logo-container">
          {partners.map((partner) => (
            <div key={partner.id} className="partner-logo">
              {/* Replace img src with your actual logo paths */}
              <img
                src= {partner.logo}
                alt={`${partner.name} logo`}
                className="logo-image"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Partners;