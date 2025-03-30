import './App.css';
// import Navbar from'./component/navbar'; 
// import Footer from './component/footer' ;
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUpForm from './pages/Authentification/SignUpForm.js'; 
import LoginForm from './pages/Authentification/LoginForm.js';
import HomePage from './pages/HomePage/Homepage.js';
import ChatBot from './pages/ChatBot/ChatBot.js';
import RecommendationPage from './pages/ChatBot/RecommendationPage.js' ;
import DoctorMap from './pages/FindDoctor/FindDoctor.js';
import Partners from './pages/HomePage/Partners.js';
import Testimonials from './pages/HomePage/testimonials.js';
import WhyUs from './pages/HomePage/why_us.js';
<link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet"></link>



function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpForm />} /> 
        <Route path="/login" element={<LoginForm />} /> 
        <Route path="/Signup" element={<SignUpForm />} /> 
        <Route path="/chatbot" element={<ChatBot />} /> 
        <Route path = "/RecommendationPage" element ={<RecommendationPage />} />
        <Route path= "/DoctorMap" element={<DoctorMap />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/why_us" element={<WhyUs />} />
        <Route path="/testimonials" element={<Testimonials />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App ;