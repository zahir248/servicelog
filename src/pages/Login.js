import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";

import "./css/Login.css";
import BASE_API_URL from "../config.js";

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
    showInfoModal: false, // To toggle the info modal
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

  // Toggle the info modal
  toggleInfoModal = () => {
    this.setState((prevState) => ({
      showInfoModal: !prevState.showInfoModal,
    }));
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

        <button
          className="floating-info-btn"
          type="button"
          onClick={() => this.setState({ showInfoModal: true })}
        >
          ℹ️
        </button>

        {this.state.showInfoModal && (
          <div className="modal-overlay">
            <div className="login-card-2">
              <div className="login-card-header">
                <h4>Vehicle Service Record Management System</h4>
                <button
                  className="close-btn"
                  onClick={() => this.setState({ showInfoModal: false })}
                >
                  &times;
                </button>
              </div>
              <div className="login-card-body-2">
                <div className="modal-content">
                  <h5>Overview</h5>
                  <p>
                    This system helps you manage and track your vehicles'
                    service history digitally. You can store information about
                    your vehicles and maintain detailed records of all service
                    work performed.
                  </p>
                  <h5>Key Features</h5>
                  <ul>
                    <li>
                      <strong>Account Management</strong>
                      <ul>
                        <li>
                          Create a new account with your name, email, and
                          password
                        </li>
                        <li>
                          Log in securely to access your personal dashboard
                        </li>
                        <li>
                          Update your profile information and password when
                          needed
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Vehicle Management</strong>
                      <ul>
                        <li>Add multiple vehicles to your account</li>
                        <li>
                          For each vehicle, you can record:
                          <ul>
                            <li>Model</li>
                            <li>Year</li>
                            <li>Registration number</li>
                          </ul>
                        </li>
                        <li>View a list of all your registered vehicles</li>
                        <li>Update vehicle information as needed</li>
                        <li>Remove vehicles from your records</li>
                        <li>Export vehicle service history as PDF reports</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Service Record Management</strong>
                      <ul>
                        <li>
                          Add service records for each vehicle, including:
                          <ul>
                            <li>Service date</li>
                            <li>Service location/workshop</li>
                            <li>Service cost</li>
                            <li>Detailed description of work performed</li>
                          </ul>
                        </li>
                        <li>View complete service history for each vehicle</li>
                        <li>Track total service costs per vehicle</li>
                        <li>View number of service records per vehicle</li>
                        <li>Update or modify service record details</li>
                        <li>Delete service records if needed</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Reports and Analytics</strong>
                      <ul>
                        <li>View total service costs for each vehicle</li>
                        <li>Access chronological service history</li>
                        <li>
                          Generate and download PDF reports containing:
                          <ul>
                            <li>Vehicle details</li>
                            <li>Complete service history</li>
                            <li>Total maintenance costs</li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Data Security</strong>
                      <ul>
                        <li>
                          All data is protected behind secure authentication
                        </li>
                        <li>
                          Each user can only access their own vehicles and
                          service records
                        </li>
                        <li>Secure password storage with encryption</li>
                      </ul>
                    </li>
                  </ul>
                  <h5>Benefits</h5>
                  <ul>
                    <li>Keep all your vehicle service records in one place</li>
                    <li>Track maintenance costs over time</li>
                    <li>Access your service history anywhere</li>
                    <li>Generate professional reports for your records</li>
                    <li>Make informed decisions about vehicle maintenance</li>
                    <li>Never lose paper service records again</li>
                  </ul>
                  <h5>Getting Started</h5>
                  <ol>
                    <li>Register for an account using your email</li>
                    <li>Add your first vehicle to the system</li>
                    <li>Start recording service activities</li>
                    <li>Access your records anytime through the dashboard</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Login;
