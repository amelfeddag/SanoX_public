import Navbar from'./../../component/navbar'; 
import VideoBackground from './video_background' ;
import Partners from './Partners';
import Specialties from './specialities';
import WhyUs from './why_us';
import Testimonials from './testimonials';
import Footer from './../../component/footer' ;

<link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet"></link>

function HomePage() {
  return (
  <div className="HomePage">
      <Navbar />
       <div class = "video-container"><VideoBackground /></div>  
      <Partners />

      <Specialties />
      <WhyUs />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default HomePage;
