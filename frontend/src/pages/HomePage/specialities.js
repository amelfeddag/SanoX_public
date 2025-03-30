import React from 'react';
import { Brain, Eye, Syringe, Heart } from 'lucide-react';
import './specialities.css' ;

const ServiceCard = ({ title, description, Icon , icon_color}) => (
  <div className="service-card">
    <div className="service-icon">
      <Icon />
    </div>
    <h3 className="service-title">{title}</h3>
    <p className="service-description">{description}</p>
  </div>
);

const Specialties = () => {
  const services = [
    {
      title: "Mental Health Service",
      description: "The service provides immediate medical care to patients with acute illnesses or injuries that require immediate attention",
      Icon: Brain
     
    },
    {
      title: "Eye Diseases Service",
      description: "The service provides immediate medical care to patients with acute illnesses or injuries that require immediate attention",
      Icon: Eye
    },
    {
      title: "Vaccination Service",
      description: "The service provides immediate medical care to patients with acute illnesses or injuries that require immediate attention",
      Icon: Syringe
    },
    {
      title: "Cardiology Service",
      description: "The service provides immediate medical care to patients with acute illnesses or injuries that require immediate attention",
      Icon: Heart
      
    }
  ];

  return (
    <div className="specialties-container" id = 'specialties'>
      <h2 className="specialties-title">
        <span className="highlight">+40</span> Services partenaires dans{' '}
        <span className="highlight">+10</span> spécialités
      </h2>
      
      <div className="services-grid">
        {services.map((service, index) => (
          <ServiceCard key={index} {...service} />
        ))}
      </div>
      
      <div className="dots-container">
        {[0, 1, 2].map((dot) => (
          <div
            key={dot}
            className={`dot ${dot === 0 ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Specialties;