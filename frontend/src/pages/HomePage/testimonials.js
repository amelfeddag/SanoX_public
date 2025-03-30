import React, { useState } from 'react';
import './testimonials.css';

const StarRating = ({ rating }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Miles',
      image: '/path-to-miles-image.jpg',
      rating: 4,
      text: 'Minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do a...'
    },
    {
      id: 2,
      name: 'Ronald Richards',
      image: '/path-to-ronald-image.jpg',
      rating: 4,
      text: 'ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.'
    },
    {
      id: 3,
      name: 'Savannah Nguyen',
      image: '/path-to-savannah-image.jpg',
      rating: 5,
      text: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua o...'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="testimonials-container" id = 'testimonials'>
      <h2 className="testimonials-title">Avis des utilisateurs</h2>
      
      <div className="testimonials-slider">
        <div 
          className="testimonials-track"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`
          }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">  
              <img 
                src="/api/placeholder/60/60"
                alt={`${testimonial.name}'s profile`}
                className="testimonial-image"
              />
              <StarRating rating={testimonial.rating} />
              <h3 className="testimonial-name">{testimonial.name}</h3>
              <p className="testimonial-text">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="slider-controls">
        <button 
          className="slider-button prev" 
          onClick={prevSlide}
          aria-label="Previous testimonial"
        >
          ←
        </button>
        <div className="slider-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <button 
          className="slider-button next" 
          onClick={nextSlide}
          aria-label="Next testimonial"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default Testimonials;