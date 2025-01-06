import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import "./css/ServiceHistory.css";
import BASE_API_URL from '../config.js';

const ServiceHistory = () => {
  document.title = "Service History"; // Set title on component mount

  const [serviceHistory, setServiceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [newService, setNewService] = useState({
    service_date: "",
    service_place: "",
    service_cost: "",
    description: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editService, setEditService] = useState({
    service_date: "",
    service_place: "",
    service_cost: "",
    description: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();

  // Define the formatDate function here
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const options = {
      weekday: "long", // Day of the week (e.g., "Monday")
      year: "numeric", // Year (e.g., "2022")
      month: "long", // Month (e.g., "May")
      day: "numeric", // Day of the month (e.g., "19")
    };

    return date.toLocaleDateString("en-GB", options); // You can adjust the locale as needed
  };

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");

    if (!userToken) {
      navigate("/");
      return;
    }

    const fetchServiceData = async () => {
      try {
        const res = await axios.get(
          `${BASE_API_URL}/service-history/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        if (res.data.status === 200) {
          setServiceHistory(res.data.history);
          if (res.data.history && res.data.history[0].vehicle) {
            setVehicle(res.data.history[0].vehicle);
          }
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Error fetching service history and vehicle data:",
          error
        );
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [id, navigate]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleView = (serviceId) => {
    const service = serviceHistory.find((item) => item?.id === serviceId);
    if (service) {
      setSelectedService(service); // Ensure selectedService is set properly
      setShowViewModal(true);
    }
  };

  const handleEdit = (serviceId) => {
    const service = serviceHistory.find((item) => item?.id === serviceId);
    if (service) {
      setEditService({
        id: service.id, // Add this line to include the ID
        service_date: service?.service_date || "",
        service_place: service?.service_place || "",
        service_cost: service?.service_cost || "",
        description: service?.description || "",
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateService = async () => {
    const userToken = localStorage.getItem("userToken");

    // Add validation to ensure ID exists
    if (!editService.id) {
      console.error("No service ID found for update");
      return;
    }

    try {
      console.log("Updating service with ID:", editService.id);

      const res = await axios.put(
        `${BASE_API_URL}/service-history/${editService.id}`,
        {
          service_date: editService.service_date,
          service_place: editService.service_place,
          service_cost: editService.service_cost,
          description: editService.description,
          vehicle_id: vehicle.id,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (res.data.status === 200) {
        setSuccessMessage("Service record updated successfully.");
        // Update the local state with the new data
        setServiceHistory((prevHistory) =>
          prevHistory.map((item) =>
            item.id === editService.id ? { ...item, ...editService } : item
          )
        );
        setShowEditModal(false);
      } else {
        console.error("Failed to update service record:", res.data.message);
      }
    } catch (error) {
      console.error(
        "Error updating service record:",
        error.response?.data || error
      );
    }
  };

  const handleDeleteClick = (serviceId) => {
    const service = serviceHistory.find((item) => item?.id === serviceId);
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    const userToken = localStorage.getItem("userToken");
    if (selectedService) {
      try {
        // Send the service ID and the vehicle ID in the delete request
        await axios.delete(
          `${BASE_API_URL}/service-history/${selectedService.id}`,
          {
            data: {
              vehicle_id: selectedService.vehicle_id, // Include vehicle ID
            },
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        // Filter out the deleted service from the serviceHistory
        setServiceHistory(
          serviceHistory.filter((item) => item?.id !== selectedService.id)
        );
        setSuccessMessage("Service record deleted successfully.");
        setShowDeleteModal(false);
        window.location.reload(); // Refresh the page
      } catch (error) {
        console.error("Error deleting service record:", error);
      }
    }
  };

  const handleAddService = async () => {
    const userToken = localStorage.getItem("userToken");

    try {
      const res = await axios.post(
        `${BASE_API_URL}/add-service-history/store/${id}`,
        {
          vehicle_id: id,
          service_date: newService.service_date,
          service_place: newService.service_place,
          service_cost: newService.service_cost,
          description: newService.description,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (res.data.status === 200) {
        setSuccessMessage("Service record added successfully.");
        setServiceHistory([...serviceHistory, res.data.history]);
        setShowAddModal(false);

        window.location.reload();
      } else {
        setSuccessMessage("Failed to add service record.");
      }
    } catch (error) {
      console.error("Error adding service record:", error);
    }
  };

  const renderActionButtons = (item) => {
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
            <button
              className="dropdown-item"
              onClick={() => handleView(item?.id)}
            >
              <i className="bi bi-eye me-2"></i>View
            </button>
          </li>
          <li>
            <button
              className="dropdown-item"
              onClick={() => handleEdit(item?.id)}
            >
              <i className="bi bi-pencil me-2"></i>Edit
            </button>
          </li>
          <li>
            <button
              className="dropdown-item text-danger"
              onClick={() => handleDeleteClick(item?.id)}
            >
              <i className="bi bi-trash me-2"></i>Delete
            </button>
          </li>
        </ul>
      </div>
    );
  };

  const serviceHistoryHTML = loading ? (
    <div className="loading-container">
      <img
        src="/assets/images/loading.gif" // Path to your loading image or spinner
        alt="Loading..."
        className="loading-spinner"
      />
    </div>
  ) : serviceHistory.length === 0 ? (
    <div className="emptydata-container-custom">
      <img
        src="/assets/images/emptydata.png" // Path to your loading image or spinner
        alt="Loading..."
        className="emptydata-spinner-custom"
      />
    </div>
  ) : (
    <table className="table table-bordered table-striped mx-auto">
      <thead className="table-primary">
        <tr>
          <th>No.</th>
          <th>Service Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {serviceHistory.map((item, index) => (
          <tr key={item?.id}>
            <td>{index + 1}</td> {/* Display the row number (1-based index) */}
            <td>{formatDate(item?.service_date)}</td>
            <td>{renderActionButtons(item)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container-fluid custom-container">
      <div className="row justify-content-center">
        <main role="main" className="col-12 px-4">
          <h4 className="text-center text-white">
            {loading
              ? ""
              : vehicle
              ? `Service History of ${vehicle.model}`
              : ""}
          </h4>

          {successMessage && (
            <div className="alert alert-success text-center" role="alert">
              {successMessage}
            </div>
          )}

          {serviceHistoryHTML}
        </main>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="btn btn-primary btn-floating"
        title="Add New Service Record"
      >
        <i className="bi bi-plus"></i>
      </button>

      <button
        onClick={handleBack}
        className="btn btn-secondary btn-floating logout-btn"
        title="Back to Dashboard"
      >
        <i className="bi bi-arrow-left text-white"></i>
      </button>

      {showAddModal && (
        <div
          className="modal show"
          style={{ display: "block", paddingTop: "30px", paddingRight: "15px" }} // Adds space from top of the page
          tabIndex="-1"
          aria-labelledby="addServiceModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addServiceModalLabel">
                  Add Service Record
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="service_date" className="form-label">
                      Service Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="service_date"
                      value={newService.service_date}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          service_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="service_place" className="form-label">
                      Service Place
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="service_place"
                      value={newService.service_place}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          service_place: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="service_cost" className="form-label">
                      Service Cost
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="service_cost"
                      value={newService.service_cost}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          service_cost: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows="3"
                      value={newService.description}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddService}
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="modal show"
          style={{ display: "block", paddingTop: "30px", paddingRight: "15px" }} // Adds space from top of the page
          tabIndex="-1"
          aria-labelledby="deleteServiceModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="deleteServiceModalLabel">
                  Confirm Deletion
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the record for{" "}
                  {formatDate(selectedService?.service_date)}?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedService && (
        <div
          className="modal show"
          style={{ display: "block", paddingTop: "30px", paddingRight: "15px" }} // Adds space from top of the page
          tabIndex="-1"
          aria-labelledby="viewServiceModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="viewServiceModalLabel">
                  View Service Record
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {selectedService ? (
                  <>
                    <p>
                      <strong>Service Date:</strong>{" "}
                      {formatDate(selectedService.service_date)}
                    </p>
                    <p>
                      <strong>Service Place:</strong>{" "}
                      {selectedService.service_place}
                    </p>
                    <p>
                      <strong>Service Cost:</strong> RM{" "}
                      {selectedService.service_cost}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedService.description}
                    </p>
                  </>
                ) : (
                  <p>No service data available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div
          className="modal show"
          style={{ display: "block", paddingTop: "30px", paddingRight: "15px" }} // Adds space from top of the page
          tabIndex="-1"
          aria-labelledby="editServiceModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editServiceModalLabel">
                  Edit Service Record
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="edit_service_date" className="form-label">
                      Service Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="edit_service_date"
                      value={editService.service_date}
                      onChange={(e) =>
                        setEditService({
                          ...editService,
                          service_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit_service_place" className="form-label">
                      Service Place
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="edit_service_place"
                      value={editService.service_place}
                      onChange={(e) =>
                        setEditService({
                          ...editService,
                          service_place: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit_service_cost" className="form-label">
                      Service Cost
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="edit_service_cost"
                      value={editService.service_cost}
                      onChange={(e) =>
                        setEditService({
                          ...editService,
                          service_cost: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit_description" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="edit_description"
                      rows="3"
                      value={editService.description}
                      onChange={(e) =>
                        setEditService({
                          ...editService,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdateService}
                  >
                    Update
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceHistory;
