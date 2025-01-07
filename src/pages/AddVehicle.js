import React, { Component } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

import "./css/AddVehicle.css";
import BASE_API_URL from "../config.js";

class AddVehicle extends Component {
  state = {
    model: "", // To store the vehicle model input
    year: "", // To store the vehicle year input
    registration_number: "", // To store the registration number input
    errors: {}, // To store error messages
    successMessage: "", // To store success messages
    isAuthenticated: false, // To track if user is logged in
    redirect: false, // To manage redirection after showing the success message
  };

  componentDidMount() {
    document.title = "Add Vehicle"; // Set the page title
  }

  // Handle input change for model, year, and registration number fields
  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleAddVehicle = async (e) => {
    e.preventDefault();

    const { model, year, registration_number } = this.state;

    // Form validation
    let errors = {};

    // Validate model (Optional: Check if it's a string and max length 255)
    if (model && typeof model !== "string") {
      errors.model = "Model must be a valid string.";
    } else if (model && model.length > 255) {
      errors.model = "Model cannot exceed 255 characters.";
    }

    // Validate year (Optional: Check if it's an integer and 4 digits long)
    if (year && (!Number.isInteger(Number(year)) || year.length !== 4)) {
      errors.year = "Year must be a 4-digit integer.";
    }

    // Validate registration number (Optional: Check if it's a string and max length 20)
    if (registration_number && typeof registration_number !== "string") {
      errors.registration_number =
        "Registration number must be a valid string.";
    } else if (registration_number && registration_number.length > 20) {
      errors.registration_number =
        "Registration number cannot exceed 20 characters.";
    }

    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    // Proceed with form submission if no validation errors
    try {
      const userToken = localStorage.getItem("userToken");

      if (!userToken) {
        this.setState({
          errors: {
            general: "User is not authenticated. Please log in again.",
          },
          successMessage: "", // Clear any previous success message
        });
        return;
      }

      const res = await axios.post(
        `${BASE_API_URL}/vehicle/store`,
        { model, year, registration_number },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      if (res.data.status === 200) {
        this.setState({
          successMessage:
            "Vehicle added successfully! Redirecting to dashboard...",
          errors: {}, // Clear any previous error messages
        });

        // Delay the redirect to show the success message
        setTimeout(() => {
          this.setState({ redirect: true }); // Trigger redirection after 2 seconds
        }, 2000);
      } else {
        this.setState({
          errors: { general: res.data.message },
          successMessage: "", // Clear success message if any error occurs
        });
      }
    } catch (error) {
      // Handle error if the request fails
      this.setState({
        errors: {
          general:
            "An error occurred while adding the vehicle. Please try again.",
        },
        successMessage: "", // Clear success message if an error occurs
      });
    }
  };

  handleCancel = () => {
    this.setState({ redirect: true }); // Trigger redirection to dashboard
  };

  render() {
    // Redirect to the dashboard if necessary
    if (this.state.redirect) {
      return <Navigate to="/dashboard" />;
    }

    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-card-header">
            <h4>Add Vehicle</h4>
            {/* Cancel Button (X) */}
            <button
              type="button"
              className="close-btn"
              aria-label="Close"
              onClick={this.handleCancel}
            >
              <span>&times;</span>
            </button>
          </div>

          <div className="login-card-body">
            {/* Display general error if there is any */}
            {this.state.errors.general && (
              <div className="alert alert-danger alert-custom show">
                {this.state.errors.general}
              </div>
            )}

            {/* Display success message if vehicle is added successfully */}
            {this.state.successMessage && (
              <div className="alert success-alert show">
                {this.state.successMessage}
              </div>
            )}

            <form onSubmit={this.handleAddVehicle}>
              {/* Vehicle Model */}
              <div className="form-group">
                <label htmlFor="model">Model</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  className="form-control"
                  placeholder="Enter vehicle model"
                  value={this.state.model}
                  onChange={this.handleInputChange}
                  required
                />
                {this.state.errors.model && (
                  <div className="text-danger">{this.state.errors.model}</div>
                )}
              </div>

              {/* Vehicle Year */}
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  className="form-control"
                  placeholder="Enter vehicle year"
                  value={this.state.year}
                  onChange={this.handleInputChange}
                  required
                />
                {this.state.errors.year && (
                  <div className="text-danger">{this.state.errors.year}</div>
                )}
              </div>

              {/* Vehicle Registration Number */}
              <div className="form-group">
                <label htmlFor="registration_number">Registration Number</label>
                <input
                  type="text"
                  id="registration_number"
                  name="registration_number"
                  className="form-control"
                  placeholder="Enter registration number"
                  value={this.state.registration_number}
                  onChange={this.handleInputChange}
                  required
                />
                {this.state.errors.registration_number && (
                  <div className="text-danger">
                    {this.state.errors.registration_number}
                  </div>
                )}
              </div>

              {/* Add Vehicle Button */}
              <button type="submit" className="btn btn-primary btn-block">
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default AddVehicle;
