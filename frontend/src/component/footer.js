import React from 'react';
import { FaFacebook, FaLinkedin, FaYoutube, FaInstagram } from 'react-icons/fa';
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="/faq">FAQ</a>
        <a href="/contact">Contactez nous</a>
        <a href="/privacy">Politique de confidentialité</a>
        <a href="/comments">Commentaire</a>
      </div>
      
      <div className="company-info">
        <p>SanoX Algérie 2025</p>
      </div>
      
      <div className="social-icons">
        <a href="https://www.facebook.com/profile.php?id=61570079374217" aria-label="Facebook"><FaFacebook /></a>
        <a href="https://www.instagram.com/sanox_algerie/?utm_source=ig_web_button_share_sheet" aria-label="Twitter"><FaInstagram /></a>
        <a href="https://www.linkedin.com/company/sanox/" aria-label="LinkedIn"><FaLinkedin /></a>
        <a href="#" aria-label="Youtube"><FaYoutube /></a>
      </div>
      
      <div className="contact-info">
        <div className="contact-item">
          <span className="location-icon">📍</span>
          <span>Ahmedabad</span>
        </div>
        <div className="contact-item">
          <span>abc@gmail.com</span>
        </div>
        <div className="contact-item">
          <span>+91 1234567890</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;