import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddVehicle from "./pages/AddVehicle";
import EditVehicle from "./pages/EditVehicle";
import ServiceHistory from "./pages/ServiceHistory";
import PrivateRoute from "./pages/PrivateRoute"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          exact
          path="/dashboard"
          element={<PrivateRoute element={<Dashboard />} />}
        />
        <Route
          exact
          path="/add-vehicle"
          element={<PrivateRoute element={<AddVehicle />} />}
        />
        <Route
          exact
          path="/edit-vehicle/:id"
          element={<PrivateRoute element={<EditVehicle />} />}
        />
        <Route
          exact
          path="/service-history/:id"
          element={<PrivateRoute element={<ServiceHistory />} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
