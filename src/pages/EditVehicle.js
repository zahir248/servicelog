import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import "./css/EditVehicle.css"; // Import your custom CSS file

const EditVehicle = () => {
  const { id } = useParams(); // Get the vehicle ID from the URL parameters
  const [vehicle, setVehicle] = useState({
    model: "",
    year: "",
    registration_number: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Edit Vehicle"; // Set the page title

    const userToken = localStorage.getItem("userToken");

    if (!userToken) {
      setRedirect(true); // Redirect to login or dashboard if no user token
      return;
    }

    // Fetch vehicle data for editing
    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/vehicle/${id}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (res.data.status === 200) {
          setVehicle(res.data.vehicle);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching vehicle details:", error);
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handleInputChange = (e) => {
    setVehicle({
      ...vehicle,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    setRedirect(true); // Trigger redirection to dashboard
  };

  const handleEditVehicle = async (e) => {
    e.preventDefault();

    const { model, year, registration_number } = vehicle;

    // You can add additional validation if necessary

    try {
      const userToken = localStorage.getItem("userToken");

      if (!userToken) {
        setErrors({
          general: "User is not authenticated. Please log in again.",
        });
        setSuccessMessage(""); // Clear success message if not authenticated
        return;
      }

      const res = await axios.put(
        `http://localhost:8000/api/vehicle/${id}`,
        { model, year, registration_number },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (res.data.status === 200) {
        setSuccessMessage(
          "Vehicle updated successfully! Redirecting to dashboard..."
        );
        setErrors({}); // Clear previous error messages

        // Delay the redirect to show the success message
        setTimeout(() => {
          setRedirect(true); // Trigger redirection after 2 seconds
        }, 2000);
      } else {
        setErrors({ general: res.data.message });
        setSuccessMessage(""); // Clear success message if any error occurs
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      setErrors({
        general:
          "An error occurred while updating the vehicle. Please try again.",
      });
      setSuccessMessage(""); // Clear success message if an error occurs
    }
  };

  if (redirect) {
    return <Navigate to="/dashboard" />;
  }

  if (loading) {
    // Loading state: Show the loading image
    return (
      <div className="loading-container">
        <img
          src="/assets/images/loading.gif" // Path to your loading image or spinner
          alt="Loading..."
          className="loading-spinner"
        />
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-card-header">
          <h4>Edit Vehicle</h4>
          {/* Cancel Button (X) */}
          <button
            type="button"
            className="close-btn"
            aria-label="Close"
            onClick={handleCancel} // Call directly
          >
            <span>&times;</span>
          </button>
        </div>

        <div className="login-card-body">
          {/* Display error if any */}
          {errors.general && (
            <div className="alert alert-danger alert-custom show">
              {errors.general}
            </div>
          )}

          {/* Display success message if vehicle is updated */}
          {successMessage && (
            <div className="alert success-alert show">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleEditVehicle}>
            {/* Vehicle Model */}
            <div className="form-group">
              <label htmlFor="model">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                className="form-control"
                placeholder="Enter vehicle model"
                value={vehicle.model}
                onChange={handleInputChange}
                required
              />
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
                value={vehicle.year}
                onChange={handleInputChange}
                required
              />
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
                value={vehicle.registration_number}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Update Vehicle Button */}
            <button type="submit" className="btn btn-primary btn-block">
              Update
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVehicle;
