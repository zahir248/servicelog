import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";

import "./css/Login.css"; 
import BASE_API_URL from '../config.js';

class Login extends Component {
  componentDidMount() {
    document.title = "Login";
  }

  state = {
    email: "", // To store the email input
    password: "", // To store the password input
    errors: {}, // To store error messages
    successMessage: "", // To store success messages
    isAuthenticated: false, // To track if user is logged in
    redirect: false, // To manage redirection after showing the success message
  };

  // Handle input change for email and password fields
  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = this.state;

    try {
      const res = await axios.post(`${BASE_API_URL}/login`, {
        email,
        password,
      });

      if (res.data.status === 200) {
        // Successful login
        localStorage.setItem("userToken", res.data.token); // Save the token to localStorage (or sessionStorage)
        this.setState({
          successMessage: "Login successful! Redirecting to dashboard...", // Set success message
          errors: {}, // Clear any previous errors
        });

        // Delay the redirect to show the success message
        setTimeout(() => {
          this.setState({ redirect: true }); // Trigger redirection
        }, 2000); // 2-second delay
      }
    } catch (error) {
      // Display specific error messages from the backend
      if (error.response && error.response.status === 401) {
        this.setState({
          errors: { general: error.response.data.message }, // Display the error message from the backend
          successMessage: "", // Clear success message if any
        });
      } else {
        // Handle unexpected errors
        this.setState({
          errors: {
            general: "An error occurred during login. Please try again.",
          },
          successMessage: "", // Clear success message if any
        });
      }
    }
  };

  render() {
    // Redirect to another page (e.g., dashboard) after delay
    if (this.state.redirect) {
      return <Navigate to="/dashboard" />;
    }

    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-card-header">
            <h4>Login</h4>
          </div>
          <div className="login-card-body">
            <form onSubmit={this.handleLogin}>
              {/* Display general error if there is any */}
              {this.state.errors.general && (
                <div className="alert error-alert show">
                  {this.state.errors.general}
                </div>
              )}

              {/* Display success message if login is successful */}
              {this.state.successMessage && (
                <div className="alert success-alert show">
                  {this.state.successMessage}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={this.state.email}
                  onChange={this.handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={this.state.password}
                  onChange={this.handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Login
              </button>
            </form>
          </div>
          <div className="login-footer">
            <p>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
