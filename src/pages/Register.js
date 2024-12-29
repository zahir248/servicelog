import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap styles
import React, { useState, useEffect } from 'react';
import './css/Register.css';

function Register() {

    useEffect(() => {
        document.title = 'Register';
      }, []);      
    
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all fields');
      return;
    }
  
    try {
      console.log("Form submitted");
  
      // API call to register
      const response = await axios.post('http://localhost:8000/api/register', formData);
  
      console.log('API Response:', response); // Log the full response
  
      // Check if response status is OK (200) from the server
      if (response.status === 200) {
        if (response.data.status === 200) {
          // Registration was successful
          setError(''); // Clear previous errors
          setSuccessMessage('Registration successful!'); // Set success message
          
          // Redirect after a brief delay to allow the success message to be seen
          setTimeout(() => {
            navigate('/'); // Redirect to login page after successful registration
          }, 2000); // 2 seconds delay
        } else {
          // Handle validation errors from the backend
          if (response.data.errors) {
            const errorMessages = Object.values(response.data.errors).map(
              (errors) => errors.join(', ') // Join multiple errors for the same field
            ).join(', '); // Join all errors with commas if multiple errors exist
            
            setError(errorMessages); // Set the error message to display
          } else {
            setError('Please fix the errors.');
          }
        }
      } else {
        setError('Unexpected error occurred, please try again.');
        console.log('Unexpected response:', response);
      }
    } catch (error) {
      console.log('Error caught:', error); // Log the full error
      if (error.response) {
        console.log('Error response:', error.response);
  
        // If there are validation errors, show them
        if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).map(
            (errors) => errors.join(', ') // Join multiple errors for the same field
          ).join(', '); // Join all errors with commas if multiple errors exist
          
          setError(errorMessages); // Set the error message to display
        } else {
          setError('Error: ' + error.response.statusText);
        }
      } else {
        setError('Network error or no response from the server.');
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <div className={`alert error-alert show`}>
              {error}
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className={`alert success-alert show`}>
              {successMessage}
            </div>
          )}

          <button type="submit" className="submit-btn btn btn-primary">
            Register
          </button>
        </form>
        <div className="login-redirect">
          <p>Already have an account? <a href="/">Login here</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
