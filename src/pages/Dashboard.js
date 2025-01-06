import React, { Component } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";

import "./css/Dashboard.css"; 
import BASE_API_URL from '../config.js';

class Vehicle extends Component {
  state = {
    vehicles: [], // To store the list of vehicles
    loading: true, // To track loading state
    successMessage: "", // To store success messages
    redirectToLogin: false, // To handle redirection after logout
    showModal: false, // To manage modal visibility for delete
    showLogoutModal: false, // To manage modal visibility for logout
    showProfileModal: false,
    vehicleToDelete: null, // Vehicle to delete
    userProfile: {
      user_name: "", // for name
      user_email: "", // for email
      password: "",
      password_confirmation: "",
    },
    showPasswordFields: false,
    updateSuccess: false,
    updateError: "",
    userName: "",
  };

  componentDidMount() {
    document.title = "Dashboard"; // Set title on component mount

    const userToken = localStorage.getItem("userToken");

    // If no token, redirect to login page
    if (!userToken) {
      this.setState({ redirectToLogin: true });
      return;
    }

    const fetchVehicles = async () => {
      const userToken = localStorage.getItem("userToken");

      try {
        const res = await axios.get(`${BASE_API_URL}/vehicles`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (res.data.status === 200) {
          // Extract user data if available in the response
          const { user_name, user_email } = res.data;

          // Store user data in state if available
          if (user_name && user_email) {
            this.setState({
              userName: user_name, // Store the user's name
              userEmail: user_email, // Store the user's email
            });
          }

          // Handle vehicles data if available
          if (res.data.vehicles) {
            const vehicles = res.data.vehicles.map((vehicle) => ({
              ...vehicle,
              totalServiceCost: vehicle.total_service_cost, // Extract total_service_cost
              totalServiceRecord: vehicle.total_service_records,
            }));

            this.setState({
              vehicles: vehicles, // Store vehicles with total service cost
              loading: false,
            });
          } else {
            // Handle the case where vehicles are not fetched
            this.setState({
              vehicles: [], // Empty array if no vehicles data
              loading: false,
              error: "No vehicles found",
            });
          }
        } else {
          this.setState({
            loading: false,
            error: "Failed to fetch data",
          });
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        this.setState({ loading: false, error: "Error fetching data" });
      }
    };

    fetchVehicles();
  }

  openProfileModal = async () => {
    const { userName, userEmail } = this.state;

    if (userName && userEmail) {
      // Set the modal state correctly with the user data
      this.setState({
        showProfileModal: true,
        userProfile: {
          ...this.state.userProfile, // Preserve the previous userProfile data
          user_name: userName, // Update name
          user_email: userEmail, // Update email
        },
      });
    } else {
      // Handle the case when user data isn't available
      console.log("User data is not available.");
    }
  };

  closeProfileModal = () => {
    this.setState({
      showProfileModal: false,
      updateSuccess: false,
      updateError: "",
    });
  };

  // Add new method to toggle password fields
  togglePasswordFields = () => {
    this.setState((prevState) => ({
      showPasswordFields: !prevState.showPasswordFields,
      userProfile: {
        ...prevState.userProfile,
        password: "",
        password_confirmation: "",
      },
    }));
  };

  handleProfileChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      userProfile: {
        ...this.state.userProfile,
        [name]: value,
      },
    });
  };

  handleProfileUpdate = async (e) => {
    e.preventDefault();
    const userToken = localStorage.getItem("userToken");

    try {
      const updateData = {
        name: this.state.userProfile.user_name,
        email: this.state.userProfile.user_email,
      };

      // Only include password fields if they are shown and password is entered
      if (this.state.showPasswordFields && this.state.userProfile.password) {
        if (
          this.state.userProfile.password !==
          this.state.userProfile.password_confirmation
        ) {
          this.setState({
            updateError: "Password and confirmation do not match",
            updateSuccess: false,
          });
          return;
        }
        updateData.password = this.state.userProfile.password;
        updateData.password_confirmation =
          this.state.userProfile.password_confirmation;
      }

      // Form validation
      if (!updateData.name || !updateData.email) {
        this.setState({
          updateError: "Name and email are required",
          updateSuccess: false,
        });
        return;
      }

      // Debug line: Log the data being sent
      console.log("Data being sent to the server:", updateData);

      const response = await axios.put(
        `${BASE_API_URL}/user/profile/update`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === 200) {
        this.setState({
          updateSuccess: true,
          updateError: "",
          userName: this.state.userProfile.user_name,
          userEmail: this.state.userProfile.user_email,
          showPasswordFields: false,
          userProfile: {
            ...this.state.userProfile,
            password: "",
            password_confirmation: "",
          },
        });

        setTimeout(() => {
          this.closeProfileModal();
          window.location.reload(); // Refresh to update the display name
        }, 1500);
      }
    } catch (error) {
      let errorMessage = "Failed to update profile. Please try again.";

      // Handle validation errors from Laravel
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      this.setState({
        updateError: errorMessage,
        updateSuccess: false,
      });
    }
  };

  // Open modal to confirm logout
  openLogoutModal = () => {
    this.setState({ showLogoutModal: true });
  };

  // Close logout modal
  closeLogoutModal = () => {
    this.setState({ showLogoutModal: false });
  };

  // Handle logout action
  handleLogout = () => {
    localStorage.removeItem("userToken"); // Remove the token from localStorage
    this.setState({ redirectToLogin: true }); // Set redirect flag
  };

  openModal = (id) => {
    this.setState({ vehicleToDelete: id, showModal: true }); // Open the modal and set the vehicle to delete
  };

  closeModal = () => {
    this.setState({ showModal: false }); // Close the modal
  };

  handleDelete = async () => {
    const { vehicleToDelete } = this.state;
    const userToken = localStorage.getItem("userToken");

    try {
      const res = await axios.delete(
        `${BASE_API_URL}/vehicle/${vehicleToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (res.data.status === 200) {
        this.setState({
          successMessage: "Vehicle deleted successfully.", // Set success message
          vehicles: this.state.vehicles.filter(
            (vehicle) => vehicle.id !== vehicleToDelete
          ), // Remove the deleted vehicle
          showModal: false, // Close the modal after successful deletion
        });

        window.location.reload(); // Refresh the page
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  handleExportPDF = async (vehicle) => {
    const userToken = localStorage.getItem("userToken");

    try {
      // Make request to Laravel backend for PDF
      const response = await axios.get(
        `${BASE_API_URL}/vehicle/${vehicle.id}/export-pdf`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          responseType: "blob", // Important for receiving PDF data
        }
      );

      // Create a blob URL from the PDF data
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${vehicle.model}_${vehicle.registration_number}_report.pdf`
      );
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      // Show error message to user
      alert("Failed to export PDF. Please try again.");
    }
  };

  renderActionButtons = (item) => {
    return (
      <div className="dropdown">
        <button
          className="btn btn-secondary btn-sm dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        ></button>
        <ul className="dropdown-menu">
          <li>
            <Link to={`/service-history/${item.id}`} className="dropdown-item">
              <i className="bi bi-tools me-2"></i>View Service History
            </Link>
          </li>
          <li>
            <Link to={`/edit-vehicle/${item.id}`} className="dropdown-item">
              <i className="bi bi-pencil me-2"></i>Edit
            </Link>
          </li>
          <li>
            <button
              className="dropdown-item"
              onClick={() => this.handleExportPDF(item)}
            >
              <i className="bi bi-file-pdf me-2"></i>Export PDF
            </button>
          </li>
          <li>
            <button
              className="dropdown-item text-danger"
              onClick={() => this.openModal(item.id)}
            >
              <i className="bi bi-trash me-2"></i>Delete
            </button>
          </li>
        </ul>
      </div>
    );
  };

  renderCard = (vehicle) => {
    // Function to generate shortform
    const getShortform = (model) => {
      const words = model.split(" ");
      if (words.length === 1) {
        return words[0][0].toUpperCase(); // First letter of a single word
      }
      return words[0][0].toUpperCase() + words[1][0].toUpperCase(); // First letters of the first two words
    };

    return (
      <div
        key={vehicle.id}
        className="card my-3 mx-auto"
        style={{ maxWidth: "400px" }}
      >
        <div className="card-body d-flex align-items-center">
          {/* Circle with the shortform */}
          <div
            className="circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            {getShortform(vehicle.model)}
          </div>
          <div>
            <h5 className="card-title mb-1">{vehicle.model}</h5>
            <p className="card-text text-muted mb-0">
              {vehicle.registration_number}
            </p>
            <p className="card-text text-muted">{vehicle.year}</p>
            {this.renderActionButtons(vehicle)}
          </div>
        </div>
      </div>
    );
  };

  render() {
    const getShortform = (model) => {
      const words = model.split(" ");
      if (words.length === 1) {
        return words[0][0].toUpperCase(); // First letter of a single word
      }
      return words[0][0].toUpperCase() + words[1][0].toUpperCase(); // First letters of the first two words
    };

    if (this.state.redirectToLogin) {
      return <Navigate to="/service-log" />; // Redirect to login page after logout
    }

    const {
      vehicles,
      loading,
      successMessage,
      showModal,
      showLogoutModal,
      showPasswordFields,
      userProfile,
    } = this.state;

    let vehicleHTML;

    // Check if vehicles are loading or if no vehicles are fetched
    if (loading) {
      vehicleHTML = (
        <div className="loading-container">
          <img
            src="/assets/images/loading.gif" // Path to your loading image or spinner
            alt="Loading..."
            className="loading-spinner"
          />
        </div>
      );
    } else if (vehicles.length === 0) {
      vehicleHTML = (
        <div className="emptydata-container-custom">
          <img
            src="/assets/images/emptydata.png" // Path to your loading image or spinner
            alt="Loading..."
            className="emptydata-spinner-custom"
          />
        </div>
      ); // Display message when no data is available
    } else {
      vehicleHTML = (
        <div className="row">
          {vehicles.map((item) => (
            <div className="col-md-4 col-sm-6 mb-4" key={item.id}>
              <div className="card h-100 position-relative">
                {/* Positioning container for action buttons */}
                <div className="card-body">
                  {/* Model and Circle Shortform Container */}
                  <div className="d-flex align-items-center">
                    {/* Circle with shortform */}
                    <div
                      className="circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      {getShortform(item.model)}{" "}
                      {/* Displaying the model shortform */}
                    </div>
                    {/* Model Name */}
                    <h5 className="card-title mb-0">{item.model}</h5>
                  </div>

                  {/* Year and Registration Number placed below the model */}
                  <div className="mt-2">
                    <p className="card-text mb-1">
                      <strong>Year:</strong> {item.year}
                    </p>
                    <p className="card-text mb-1">
                      <strong>Registration Number:</strong>{" "}
                      {item.registration_number}
                    </p>
                    <p className="card-text mb-1">
                      <strong>Total Service: </strong> {item.totalServiceRecord}
                    </p>
                    <p className="card-text">
                      <strong>Total Service Cost: </strong> RM{" "}
                      {item.totalServiceCost.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Absolute position for action buttons */}
                <div className="text-end position-absolute top-0 end-0 p-3">
                  {this.renderActionButtons(item)} {/* Render action buttons */}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="container-fluid custom-container">
        <div className="row justify-content-center">
          <main role="main" className="col-12 px-4">
            <h4 className="text-center text-white">
              {this.state.vehicles && this.state.vehicles.length > 0
                ? `${this.state.userName}'s vehicles`
                : ""}
            </h4>

            {/* Display success message */}
            {successMessage && (
              <div className="alert alert-success text-center" role="alert">
                {successMessage}
              </div>
            )}

            {vehicleHTML}
          </main>
        </div>

        {/* Floating Add Vehicle Button */}
        <Link
          to="/add-vehicle"
          className="btn btn-primary btn-floating"
          title="Add Vehicle"
        >
          <i className="bi bi-plus"></i>
        </Link>

        {/* Floating Logout Button */}
        <button
          onClick={this.openLogoutModal}
          className="btn btn-danger btn-floating logout-btn"
          title="Logout"
        >
          <i className="bi bi-box-arrow-right text-white"></i>
        </button>

        {/* Floating Edit Profile Button */}
        <button
          onClick={this.openProfileModal}
          className="btn btn-success update-profile-btn"
          title="Edit Profile"
        >
          <i className="bi bi-person-circle"></i>
        </button>

        {/* Modal for deletion confirmation */}
        {showModal && (
          <div
            className="modal show"
            style={{
              display: "block",
              paddingTop: "30px",
              paddingRight: "15px",
            }} // Adds space from top of the page
            tabIndex="-1"
            aria-labelledby="deleteModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="deleteModalLabel">
                    Confirm Delete
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={this.closeModal}
                  ></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete this vehicle? Please note that
                  this action will also delete all associated service records.
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={this.closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={this.handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Update Modal */}
        {this.state.showProfileModal && (
          <div
            className="modal show"
            style={{
              display: "block",
              paddingTop: "30px",
              paddingRight: "15px",
            }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Profile</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={this.closeProfileModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Success and Error Alerts */}
                  {this.state.updateSuccess && (
                    <div className="alert alert-success">
                      Profile updated successfully!
                    </div>
                  )}
                  {this.state.updateError && (
                    <div className="alert alert-danger">
                      {this.state.updateError}
                    </div>
                  )}

                  {/* Profile Update Form */}
                  <form onSubmit={this.handleProfileUpdate}>
                    {/* Name Field */}
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="user_name" // Map to 'user_name'
                        value={this.state.userProfile.user_name || ""} // Use user_name from state
                        onChange={this.handleProfileChange}
                      />
                    </div>

                    {/* Email Field */}
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="user_email" // Map to 'user_email'
                        value={this.state.userProfile.user_email || ""} // Use user_email from state
                        onChange={this.handleProfileChange}
                      />
                    </div>

                    <div className="mb-3">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={this.togglePasswordFields}
                      >
                        {showPasswordFields
                          ? "Hide Password Fields"
                          : "Change Password"}
                      </button>
                    </div>

                    {showPasswordFields && (
                      <>
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={userProfile.password || ""}
                            onChange={this.handleProfileChange}
                          />
                        </div>

                        <div className="mb-3">
                          <label
                            htmlFor="password_confirmation"
                            className="form-label"
                          >
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={userProfile.password_confirmation || ""}
                            onChange={this.handleProfileChange}
                          />
                        </div>
                      </>
                    )}

                    {/* Submit Button */}
                    <div className="modal-footer">
                      <button type="submit" className="btn btn-primary">
                        Update
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for logout confirmation */}
        {showLogoutModal && (
          <div
            className="modal show"
            style={{
              display: "block",
              paddingTop: "30px",
              paddingRight: "15px",
            }} // Adds space from top of the page
            tabIndex="-1"
            aria-labelledby="logoutModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="logoutModalLabel">
                    Confirm Logout
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={this.closeLogoutModal}
                  ></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to log out?
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={this.closeLogoutModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={this.handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Vehicle;
