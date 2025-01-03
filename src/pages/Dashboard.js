import React, { Component } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import "./css/Dashboard.css"; // Import your custom CSS file

class Vehicle extends Component {
  state = {
    vehicles: [], // To store the list of vehicles
    loading: true, // To track loading state
    successMessage: "", // To store success messages
    redirectToLogin: false, // To handle redirection after logout
    showModal: false, // To manage modal visibility for delete
    showLogoutModal: false, // To manage modal visibility for logout
    vehicleToDelete: null, // Vehicle to delete
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
      try {
        const res = await axios.get("http://localhost:8000/api/vehicles", {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        if (res.data.status === 200) {
          this.setState({
            vehicles: res.data.vehicles,
            userName: res.data.user_name, // Store the user's name in the state
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        this.setState({ loading: false });
      }
    };

    fetchVehicles();
  }

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
        `http://localhost:8000/api/vehicle/${vehicleToDelete}`,
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

        // Delay the redirect to show the success message
        setTimeout(() => {
          this.setState({ successMessage: "" }); // Clear the success message after 3 seconds
        }, 3000);
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
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
              <i className="bi bi-tools me-2"></i>Service History
            </Link>
          </li>
          <li>
            <Link to={`/edit-vehicle/${item.id}`} className="dropdown-item">
              <i className="bi bi-pencil me-2"></i>Edit
            </Link>
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
      return <Navigate to="/" />; // Redirect to login page after logout
    }

    const { vehicles, loading, successMessage, showModal, showLogoutModal } =
      this.state;

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
      vehicleHTML = <div className="emptydata-container-custom">
      <img
        src="/assets/images/emptydata.png" // Path to your loading image or spinner
        alt="Loading..."
        className="emptydata-spinner-custom"
      />
    </div>; // Display message when no data is available
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
                    <p className="card-text">
                      <strong>Registration Number:</strong>{" "}
                      {item.registration_number}
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
              {this.state.userName ? `${this.state.userName}'s vehicles` : ""}
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
