import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import './css/ServiceHistory.css';

const ServiceHistory = () => {
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

  const { id } = useParams();
  const navigate = useNavigate();

  // Define the formatDate function here
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    const options = {
      weekday: 'long', // Day of the week (e.g., "Monday")
      year: 'numeric', // Year (e.g., "2022")
      month: 'long', // Month (e.g., "May")
      day: 'numeric', // Day of the month (e.g., "19")
    };
    
    return date.toLocaleDateString('en-GB', options); // You can adjust the locale as needed
  };

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");

    if (!userToken) {
      navigate("/"); 
      return;
    }

    const fetchServiceData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/service-history/${id}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

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
        console.error("Error fetching service history and vehicle data:", error);
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [id, navigate]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleView = (serviceId) => {
    const service = serviceHistory.find(item => item.id === serviceId);
    if (service) {
      setSelectedService(service);  // Ensure selectedService is set properly
      setShowViewModal(true);
    }
  };

  const handleEdit = (serviceId) => {
    navigate(`/service/${serviceId}/edit`);
  };

  const handleDeleteClick = (serviceId) => {
    const service = serviceHistory.find(item => item.id === serviceId);
    setSelectedService(service);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    const userToken = localStorage.getItem("userToken");
    if (selectedService) {
      try {
        // Send the service ID and the vehicle ID in the delete request
        await axios.delete(`http://localhost:8000/api/service-history/${selectedService.id}`, {
          data: {
            vehicle_id: selectedService.vehicle_id,  // Include vehicle ID
          },
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
  
        // Filter out the deleted service from the serviceHistory
        setServiceHistory(serviceHistory.filter((item) => item.id !== selectedService.id));
        setSuccessMessage("Service record deleted successfully.");
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error deleting service record:", error);
      }
    }
  };

  const handleAddService = async () => {
    const userToken = localStorage.getItem("userToken");

    try {
      const res = await axios.post(
        `http://localhost:8000/api/add-service-history/store/${id}`, 
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

  const serviceHistoryHTML = loading ? (
    <h2>Loading...</h2>
  ) : serviceHistory.length === 0 ? (
    <h2>No records found</h2>
  ) : (
    <table className="table table-bordered table-striped mx-auto">
      <thead className="table-active">
        <tr>
          <th>Service Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {serviceHistory.map((item) => (
          <tr key={item.id}>
            <td>{formatDate(item.service_date)}</td> {/* Format the service date */}
            <td>
              <button
                className="btn btn-info btn-sm mx-1"
                onClick={() => handleView(item.id)}
                title="View"
              >
                <i className="bi bi-eye"></i>
              </button>
              <button
                className="btn btn-warning btn-sm mx-1"
                onClick={() => handleEdit(item.id)}
                title="Edit"
              >
                <i className="bi bi-pencil"></i>
              </button>
              <button
                className="btn btn-danger btn-sm mx-1"
                onClick={() => handleDeleteClick(item.id)}
                title="Delete"
              >
                <i className="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container-fluid custom-container">
      <div className="row justify-content-center">
        <main role="main" className="col-12 px-4">
          <h4 className="text-center">
            {loading ? "Loading..." : vehicle ? `Service History of ${vehicle.model}` : "Vehicle data not available"}
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
        <div className="modal show" style={{ display: "block" }} tabIndex="-1" aria-labelledby="addServiceModalLabel" aria-hidden="true">
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
                      onChange={(e) => setNewService({ ...newService, service_date: e.target.value })}
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
                      onChange={(e) => setNewService({ ...newService, service_place: e.target.value })}
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
                      onChange={(e) => setNewService({ ...newService, service_cost: e.target.value })}
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
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddService}
                  >
                    Add Service Record
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

{showDeleteModal && (
        <div className="modal show" style={{ display: "block" }} tabIndex="-1" aria-labelledby="deleteServiceModalLabel" aria-hidden="true">
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
                <p>Are you sure you want to delete the record for {selectedService?.service_date}?</p>
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
        <div className="modal show" style={{ display: "block" }} tabIndex="-1" aria-labelledby="viewServiceModalLabel" aria-hidden="true">
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
                    <p><strong>Service Date:</strong> {formatDate(selectedService.service_date)}</p>
                    <p><strong>Service Place:</strong> {selectedService.service_place}</p>
                    <p><strong>Service Cost:</strong> RM {selectedService.service_cost}</p>
                    <p><strong>Description:</strong> {selectedService.description}</p>
                  </>
                ) : (
                  <p>No service data available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceHistory;
