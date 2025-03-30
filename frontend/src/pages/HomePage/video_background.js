import React from 'react';
import { useNavigate } from 'react-router-dom'; 

import './video_background.css'
import myVideo from './../../assets/background_video.mp4';
const VideoBackground = () => {
  const navigate = useNavigate();

  const toSignup = () => {
    navigate('/signup'); 
  }

  const toChatbot = () => {
    navigate ('/chatbot') ;
  }
  return (
    <div className="video-container">
      <video autoPlay muted loop width="100%" height="auto" controls>
        <source src={myVideo} type="video/mp4" />
      </video>
      <div class="overlay" width="100%">
      
        <h1>Votre allié pour prendre soin de 
        <span> votre santé</span></h1>
        <h2>Cliquez sur "Commencer l'anamnèse" et laissez l'IA vous guider, vers le service, le médecin,
           et le temps qu'il faut pour soigner.</h2>
           <div class="start">
            <button class = "vers_questionnaire" onClick={toChatbot}>Je suis patient </button>
            <button class = "inscription" onClick={toSignup}>Je suis médecin</button>
          </div>

      
       </div> 
       {/* end of overlay */}
    </div>
    
  );
};

export default VideoBackground;