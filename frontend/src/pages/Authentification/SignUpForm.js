import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpForm.css';
import Navbar from '../../component/navbar';
import Footer from '../../component/footer';

const SignUpForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    phoneNumber: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleClick = () => {
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Account created successfully. Please verify your email.');
        setFormData({
          firstName: '',
          lastName: '',
          country: '',
          phoneNumber: '',
          email: '',
          password: '',
        });
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="signup-container">
        <div className="signup-form">
          <h1 className="form-title">Commencez maintenant.</h1>
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">Prénom</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" required />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Nom</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="form-input" required />
            </div>

            <div className="form-group">
              <label htmlFor="country" className="form-label">Pays</label>
              <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} className="form-input" required />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">Numéro de téléphone</label>
              <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="form-input" required />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="form-input" required />
            </div>

            <button type="submit" className="submit-button">S'inscrire</button>

            <p className="login-link">
              Vous avez un compte?{' '}
              <a onClick={handleClick}>Connectez-vous</a>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignUpForm;
