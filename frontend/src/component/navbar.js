import React, { useState, useRef, useEffect } from 'react';
// import logo1 from './../assets/logos/sanox_logo.svg';
// import logo2 from './../assets/logos/sanox_logo2.svg' ;
import logo from './../assets/logos/sanox_logo_mobile.svg';
import avatar from'./../assets/avatar.png';

import './navbar.css';
import { useMediaQuery } from '@mui/material'; 
import Avatar from '@mui/material/Avatar';
// import { Router } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { animateScroll as scroll } from 'react-scroll'; 

function DesktopNavbar() {
  const [logoSize, setLogoSize] = useState(50); // Initialize logoSize with a default value
  const textContainerRef = useRef(null);

  useEffect(() => {
    const measureTextWidth = () => {
      if (textContainerRef.current) {
        const textWidth = textContainerRef.current.offsetWidth;
        setLogoSize(Math.max(50, textWidth / 5)); // Example: Logo size is at least 50px
      }
    };

    measureTextWidth();
    window.addEventListener('resize', measureTextWidth);

    return () => {
      window.removeEventListener('resize', measureTextWidth);
    };
  }, []);

  return (
    <>
      <nav className="navbar">
        <img src={logo} alt="sanox logo" style={{ width: `${logoSize}px` }} /> 
        <div ref={textContainerRef}> 
          <div className="nav_pages"> 
            <Link to ="/">Accueil</Link>
            <Link to ="/partners" smooth={true} duration={500}>Services partenaires</Link>
            <Link to ="/why_us" smooth={true} duration={500}>Pourquoi nous?</Link>
            <Link to ="/testimonials" smooth={true} duration={500}>Avis des utilisateurs</Link>
          </div>
        </div>
        <div className="flex items-center"> 
          <Avatar alt="User" src={avatar} /> 
        </div>
      </nav>

     
    </>


  );
}


function MobileNavbar() {
  return (
    <nav className="navbar" style={{ padding: '1rem' }}> 
      <div style={{ display: 'flex', justifyContent: 'center' , alignItems: 'center'}}>
        <img src={logo} alt="sanox logo" />
      </div>
      <div className="flex items-center"> 
        {/* Add this div for avatar */}
        <Avatar alt="User" src="/path/to/user/image.jpg" /> 
      </div>
    </nav>
  );
}




function Navbar() {
  const matches = useMediaQuery('(min-width: 600px)'); 

  return (
    <>
      {matches && <DesktopNavbar />} 
      {!matches && <MobileNavbar />} 
    </>
  );

}

export default Navbar;