import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";

import "./css/Register.css";
import BASE_API_URL from "../config.js";

function Register() {
  useEffect(() => {
    document.title = "Register";
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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

    // Client-side validation
    if (!formData.name || formData.name.trim() === "") {
      setError("Name is required");
      return;
    }

    if (formData.name.length > 255) {
      setError("Name must not exceed 255 characters");
      return;
    }

    if (!formData.email || formData.email.trim() === "") {
      setError("Email is required");
      return;
    }

    // Email format validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.email.length > 255) {
      setError("Email must not exceed 255 characters");
      return;
    }

    if (!formData.password || formData.password.trim() === "") {
      setError("Password is required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      // console.log("Form submitted");

      // Clear previous errors and success messages
      setError("");
      setSuccessMessage("");

      // API call to register
      const response = await axios.post(`${BASE_API_URL}/register`, formData);

      // console.log("API Response:", response); // Log the full response

      if (response.status === 200 && response.data.status === 200) {
        // Registration successful
        setSuccessMessage("Registration successful!");

        // Redirect after a delay
        setTimeout(() => {
          navigate("/servicelog");
        }, 2000);
      } else {
        // Handle server-side validation errors
        if (response.data.errors) {
          const errorMessages = Object.values(response.data.errors)
            .map((errors) => errors.join(", "))
            .join(", ");
          setError(errorMessages);
        } else {
          setError("Unexpected error occurred. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error caught:", error); // Log the error
      if (error.response) {
        if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors)
            .map((errors) => errors.join(", "))
            .join(", ");
          setError(errorMessages);
        } else {
          setError("Error: " + error.response.statusText);
        }
      } else {
        setError("Network error or no response from the server.");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h4>Create an Account</h4>
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
          {error && <div className={`alert error-alert show`}>{error}</div>}

          {/* Success message */}
          {successMessage && (
            <div className={`alert success-alert show`}>{successMessage}</div>
          )}

          <button type="submit" className="submit-btn btn btn-primary">
            Register
          </button>
        </form>
        <div className="login-redirect">
          <p>
            Already have an account? <a href="/servicelog">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
